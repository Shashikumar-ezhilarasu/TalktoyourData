import { Request, Response } from "express";
import { OrchestratorAgent } from "../pipeline/query/OrchestratorAgent";
import { queryEventBus } from "../utils/eventBus";
import { Query } from "../models/Query.model";
import { ChatSession } from "../models/ChatSession.model";
import { User } from "../models/User.model";

export class QueryController {
  private orchestrator = new OrchestratorAgent();

  async submitQuery(req: Request, res: Response) {
    const { datasetId, question, sessionId } = req.body;
    const userId = req.user?.userId || "anonymous";
    const queryId = Math.random().toString(36).substring(7);

    if (!datasetId || !question) {
      return res
        .status(400)
        .json({ error: "datasetId and question are required" });
    }

    try {
      const chatSession = sessionId
        ? await ChatSession.findOne({ _id: sessionId, userId })
        : await ChatSession.create({
            userId,
            datasetId,
            title: String(question).slice(0, 60),
          });

      if (!chatSession) {
        return res.status(404).json({ error: "Chat session not found" });
      }

      // 1. Return 202 Accepted + QueryID immediately for async UI
      res.status(202).json({ queryId, sessionId: String(chatSession._id) });

      // 2. Start Background Orchestration
      const startTime = Date.now();

      // We wrap the orchestrator to emit events
      // In a production system, these calls would be inside the agents
      queryEventBus.emitEvent(queryId, "intent_classified", {
        status: "running",
      });

      const userDb = req.user?.email ? await User.findOne({ email: req.user.email }) : null;
      const contextMemory = userDb?.contextMemory || "";

      const result = await this.orchestrator.execute(
        datasetId,
        question,
        queryId,
        contextMemory
      );

      const durationMs = Date.now() - startTime;

      // 3. Save to History
      const queryDoc = await Query.create({
        userId,
        sessionId: chatSession._id,
        datasetId,
        question,
        intent: result.intent,
        result,
        durationMs,
        createdAt: new Date(),
      });

      await ChatSession.updateOne(
        { _id: chatSession._id },
        { $set: { lastMessageAt: new Date() } },
      );

      // Auto-title a fresh session from its first user prompt.
      if (!chatSession.title || chatSession.title === "New chat") {
        const autoTitle = String(question).trim().slice(0, 64);
        if (autoTitle) {
          await ChatSession.updateOne(
            { _id: chatSession._id },
            { $set: { title: autoTitle } },
          );
        }
      }

      // 4. Signal Completion via SSE
      queryEventBus.emitEvent(queryId, "insight_ready", {
        ...result,
        _id: queryDoc._id,
        question,
        createdAt: queryDoc.createdAt,
      });
      console.log(`✅ Query ${queryId} completed in local mode.`);
    } catch (err: any) {
      console.error("Query execution failed:", err);
      queryEventBus.emitEvent(queryId, "error", { message: err.message });
    }
  }
}
