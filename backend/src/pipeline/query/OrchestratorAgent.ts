import { IntentClassifier } from './IntentClassifier';
import { SchemaResolverAgent } from './SchemaResolverAgent';
import { Dataset } from '../../models/Dataset.model';
import { DataChunk } from '../../models/DataChunk.model';
import { queryEventBus } from '../../utils/eventBus';

// SubAgents
import { BreakdownSubAgent } from './subagents/BreakdownSubAgent';
import { SummarySubAgent } from './subagents/SummarySubAgent';
import { CompareSubAgent } from './subagents/CompareSubAgent';
import { AnomalySubAgent } from './subagents/AnomalySubAgent';
import { GeneralAgent } from './subagents/GeneralAgent';

export class OrchestratorAgent {
  private classifier = new IntentClassifier();
  private resolver = new SchemaResolverAgent();
  
  async execute(datasetId: string, question: string, queryId?: string, contextMemory: string = "") {
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) throw new Error('Dataset not found');

    const emit = (stage: string, message: string) => {
      if (queryId) {
        queryEventBus.emitEvent(queryId, 'pipeline_update', { stage, message });
      }
    };

    // 1. Resolve Schema using Gemini Embeddings
    emit('RESOLVING_SCHEMA', 'Matching columns using vector intelligence...');
    const resolved = await this.resolver.resolve(datasetId, question);

    // 2. Classify Intent using Gemini Flash
    emit('CLASSIFYING_INTENT', 'Analyzing request pattern (LLM)...');
    const intent = await this.classifier.classify(question, `Dataset: ${dataset.name}`);

    // 3. Fetch Data
    emit('FETCHING_DATA', `Loading data for ${intent.intent} operation...`);
    const chunks = await DataChunk.find({ datasetId }).limit(20).sort({ chunkIndex: 1 });
    const data = chunks.flatMap(c => c.rows);

    // 4. Dispatch to SubAgent (Hybrid)
    emit('AGENT_EXECUTION', 'Running hybrid intelligence reasoning...');
    
    let result;
    if (intent.intent === 'GENERAL') {
        const memoryString = contextMemory ? `User Context Memory (Prioritize this): ${contextMemory}` : "";
        const context = `Dataset: ${dataset.name}, Columns: ${dataset.headers.join(', ')}\n${memoryString}`;
        result = await new GeneralAgent().execute(question, context);
    } else {
        switch (intent.intent) {
            case 'COMPARE':
                result = await new CompareSubAgent().execute(data, resolved, question);
                break;
            case 'BREAKDOWN':
                result = await new BreakdownSubAgent().execute(data, resolved, question);
                break;
            case 'SUMMARY':
                result = await new SummarySubAgent().execute(data, resolved, question);
                break;
            case 'ANOMALY':
                result = await new AnomalySubAgent().execute(data, resolved, question);
                break;
            default:
                result = await new SummarySubAgent().execute(data, resolved, question);
        }
    }

    emit('COMPILING_INSIGHT', 'Analysis complete. Displaying report.');
    return { ...result, confidence: intent.confidence || 0.9, durationMs: 1 };
  }
}

