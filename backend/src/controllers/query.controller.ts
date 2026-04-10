import { Request, Response } from 'express';
import { OrchestratorAgent } from '../pipeline/query/OrchestratorAgent';
import { queryEventBus } from '../utils/eventBus';
import { Query } from '../models/Query.model';

export class QueryController {
  private orchestrator = new OrchestratorAgent();

  async submitQuery(req: Request, res: Response) {
    const { datasetId, question } = req.body;
    const queryId = Math.random().toString(36).substring(7);

    try {
      // 1. Return 202 Accepted + QueryID immediately for async UI
      res.status(202).json({ queryId });

      // 2. Start Background Orchestration
      const startTime = Date.now();
      
      // We wrap the orchestrator to emit events
      // In a production system, these calls would be inside the agents
      queryEventBus.emitEvent(queryId, 'intent_classified', { status: 'running' });
      
      const result = await this.orchestrator.execute(datasetId, question);
      
      const durationMs = Date.now() - startTime;

      // 3. Save to History
      const queryDoc = await Query.create({
        datasetId,
        question,
        intent: result.intent,
        result,
        durationMs,
        createdAt: new Date()
      });

      // 4. Signal Completion via SSE
      queryEventBus.emitEvent(queryId, 'insight_ready', { ...result, _id: queryDoc._id });
      
    } catch (err: any) {
      console.error('Query execution failed:', err);
      queryEventBus.emitEvent(queryId, 'error', { message: err.message });
    }
  }
}
