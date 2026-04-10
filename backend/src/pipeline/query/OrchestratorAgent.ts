import { IntentClassifier } from './IntentClassifier';
import { SchemaResolverAgent } from './SchemaResolverAgent';
import { Dataset } from '../../models/Dataset.model';
import { DataChunk } from '../../models/DataChunk.model';

// SubAgents
import { BreakdownSubAgent } from './subagents/BreakdownSubAgent';
import { SummarySubAgent } from './subagents/SummarySubAgent';
import { CompareSubAgent } from './subagents/CompareSubAgent';
import { AnomalySubAgent } from './subagents/AnomalySubAgent';

export class OrchestratorAgent {
  private classifier = new IntentClassifier();
  private resolver = new SchemaResolverAgent();
  
  async execute(datasetId: string, question: string) {
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) throw new Error('Dataset not found');

    // 1. Resolve Schema (Semantic Layer)
    const resolved = await this.resolver.resolve(datasetId, question);

    // 2. Classify Intent
    const context = `
      Dataset: ${dataset.name}
      Columns: ${dataset.headers.join(', ')}
      Resolved Metrics: ${resolved.metricColumns.map(c => c.columnName).join(', ')}
    `;
    const intent = await this.classifier.classify(question, context);

    if (intent.clarificationNeeded) {
        return { type: 'CLARIFICATION', question: intent.clarificationQuestion };
    }

    // 3. Fetch Data (Chunked or Batch)
    const chunks = await DataChunk.find({ datasetId }).limit(10).sort({ chunkIndex: 1 });
    const data = chunks.flatMap(c => c.rows);

    // 4. Dispatch to SubAgent
    let result;
    switch (intent.intent) {
        case 'BREAKDOWN':
            result = await new BreakdownSubAgent().execute(data, resolved, question);
            break;
        case 'SUMMARY':
            result = await new SummarySubAgent().execute(data, resolved, question);
            break;
        case 'COMPARISON':
            result = await new CompareSubAgent().execute(data, resolved, question);
            break;
        case 'ANOMALY':
            result = await new AnomalySubAgent().execute(data, resolved, question);
            break;
        default:
            // Fallback to summary if unknown
            result = await new SummarySubAgent().execute(data, resolved, question);
    }

    return result;
  }
}
