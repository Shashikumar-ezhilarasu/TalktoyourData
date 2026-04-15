import { IntentClassifier } from "./IntentClassifier";
import { SchemaResolverAgent } from "./SchemaResolverAgent";
import { Dataset } from "../../models/Dataset.model";
import { DataChunk } from "../../models/DataChunk.model";
import { queryEventBus } from "../../utils/eventBus";

// SubAgents
import { BreakdownSubAgent } from "./subagents/BreakdownSubAgent";
import { SummarySubAgent } from "./subagents/SummarySubAgent";
import { CompareSubAgent } from "./subagents/CompareSubAgent";
import { AnomalySubAgent } from "./subagents/AnomalySubAgent";
import { GeneralAgent } from "./subagents/GeneralAgent";

export class OrchestratorAgent {
  private classifier = new IntentClassifier();
  private resolver = new SchemaResolverAgent();

  private normalizeResult(result: any, fallbackIntent: string) {
    const labels = Array.isArray(result?.chartData?.labels)
      ? result.chartData.labels.map((label: any) => String(label))
      : [];
    const values = Array.isArray(result?.chartData?.values)
      ? result.chartData.values.map((value: any) => Number(value || 0))
      : [];
    const secondaryValues = Array.isArray(result?.chartData?.secondaryValues)
      ? result.chartData.secondaryValues.map((value: any) => Number(value || 0))
      : undefined;

    const type =
      result?.chartData?.type === "bar" ||
      result?.chartData?.type === "line" ||
      result?.chartData?.type === "pie" ||
      result?.chartData?.type === "comparison"
        ? result.chartData.type
        : "bar";

    return {
      ...result,
      intent: String(result?.intent || fallbackIntent),
      headline: String(result?.headline || "Analysis complete"),
      metricName: String(result?.metricName || "Metric"),
      metricValue: Number(result?.metricValue || 0),
      changeValue: Number(result?.changeValue || 0),
      changeDirection: ["up", "down", "flat", "none"].includes(
        result?.changeDirection,
      )
        ? result.changeDirection
        : "none",
      explanation: String(
        result?.explanation ||
          "No structured chart data could be produced for this query, but textual analysis is available.",
      ),
      chartData: {
        type,
        labels,
        values,
        ...(secondaryValues ? { secondaryValues } : {}),
      },
      suggestedFollowUps: Array.isArray(result?.suggestedFollowUps)
        ? result.suggestedFollowUps
        : [],
      sourceSummary: String(
        result?.sourceSummary ||
          "Fallback analytics path (chart unavailable for this query)",
      ),
    };
  }

  private buildFallbackResult(
    intent: string,
    question: string,
    reason: string,
  ) {
    return this.normalizeResult(
      {
        intent,
        headline: "Unable to render chart for this query",
        metricName: "Unavailable",
        metricValue: 0,
        changeValue: 0,
        changeDirection: "none",
        explanation:
          "The requested analytics could not be fully structured into chart data for this prompt. You can rephrase with a specific metric and dimension to get a chart.",
        chartData: {
          type: "bar",
          labels: [],
          values: [],
        },
        suggestedFollowUps: [
          `Break down ${question} by top category`,
          `Compare the top two groups for ${question}`,
        ],
        sourceSummary: `Graceful fallback: ${reason}`,
      },
      intent,
    );
  }

  async execute(
    datasetId: string,
    question: string,
    queryId?: string,
    contextMemory: string = "",
  ) {
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) throw new Error("Dataset not found");

    const emit = (stage: string, message: string) => {
      if (queryId) {
        queryEventBus.emitEvent(queryId, "pipeline_update", { stage, message });
      }
    };

    // 1. Resolve Schema using Gemini Embeddings
    emit("RESOLVING_SCHEMA", "Matching columns using vector intelligence...");
    const resolved = await this.resolver.resolve(datasetId, question);

    // 2. Classify Intent using Gemini Flash
    emit("CLASSIFYING_INTENT", "Analyzing request pattern (LLM)...");
    const intent = await this.classifier.classify(
      question,
      `Dataset: ${dataset.name}`,
    );

    // 3. Fetch Data
    emit("FETCHING_DATA", `Loading data for ${intent.intent} operation...`);
    const chunks = await DataChunk.find({ datasetId })
      .limit(20)
      .sort({ chunkIndex: 1 });
    const data = chunks.flatMap((c) => c.rows);

    // 4. Dispatch to SubAgent (Hybrid)
    emit("AGENT_EXECUTION", "Running hybrid intelligence reasoning...");

    let result;
    if (intent.intent === "GENERAL") {
      const memoryString = contextMemory
        ? `User Context Memory (Prioritize this): ${contextMemory}`
        : "";
      const context = `Dataset: ${dataset.name}, Columns: ${dataset.headers.join(", ")}\n${memoryString}`;
      result = await new GeneralAgent().execute(question, context);
      result = this.normalizeResult(result, "GENERAL");
    } else {
      try {
        switch (intent.intent) {
          case "COMPARE":
            result = await new CompareSubAgent().execute(
              data,
              resolved,
              question,
            );
            break;
          case "BREAKDOWN":
            result = await new BreakdownSubAgent().execute(
              data,
              resolved,
              question,
            );
            break;
          case "SUMMARY":
            result = await new SummarySubAgent().execute(
              data,
              resolved,
              question,
            );
            break;
          case "ANOMALY":
            result = await new AnomalySubAgent().execute(
              data,
              resolved,
              question,
            );
            break;
          default:
            result = await new SummarySubAgent().execute(
              data,
              resolved,
              question,
            );
        }
        result = this.normalizeResult(result, intent.intent);
      } catch (subAgentErr: any) {
        emit(
          "AGENT_EXECUTION",
          `Primary ${intent.intent} flow failed, using fallback analysis...`,
        );
        console.error(`Primary subagent ${intent.intent} failed`, subAgentErr);

        try {
          const summaryFallback = await new SummarySubAgent().execute(
            data,
            resolved,
            question,
          );
          result = this.normalizeResult(summaryFallback, "SUMMARY");
          result.sourceSummary = `Fallback summary from ${intent.intent} request`;
        } catch (summaryErr: any) {
          console.error("Summary fallback failed", summaryErr);
          const memoryString = contextMemory
            ? `User Context Memory (Prioritize this): ${contextMemory}`
            : "";
          const context = `Dataset: ${dataset.name}, Columns: ${dataset.headers.join(", ")}\n${memoryString}`;
          try {
            const generalFallback = await new GeneralAgent().execute(
              question,
              `${context}\nFailure reason: ${subAgentErr?.message || "Unknown"}`,
            );
            result = this.normalizeResult(generalFallback, "GENERAL");
            result.sourceSummary = `General fallback after ${intent.intent} failure`;
          } catch (generalErr: any) {
            console.error("General fallback failed", generalErr);
            result = this.buildFallbackResult(
              intent.intent,
              question,
              subAgentErr?.message || "unknown subagent failure",
            );
          }
        }
      }
    }

    emit("COMPILING_INSIGHT", "Analysis complete. Displaying report.");
    return { ...result, confidence: intent.confidence || 0.9, durationMs: 1 };
  }
}
