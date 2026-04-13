import mongoose from "mongoose";
import { Request, Response } from "express";
import { ChatSession } from "../models/ChatSession.model";
import { Query } from "../models/Query.model";

export class ChatController {
  async ensureSession(req: Request, res: Response) {
    try {
      const userId = req.user?.userId || "anonymous";

      const { datasetId, title, forceNew } = req.body || {};
      const query: Record<string, any> = {
        userId: userId,
      };

      if (datasetId) {
        query.datasetId = new mongoose.Types.ObjectId(datasetId);
      }

      let session = null;

      if (!forceNew) {
        session = await ChatSession.findOne(query).sort({ updatedAt: -1 });
      }

      if (!session) {
        session = await ChatSession.create({
          userId,
          datasetId,
          title: title || "New chat",
        });
      }

      return res.json({ session });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to ensure session" });
    }
  }

  async listSessions(req: Request, res: Response) {
    try {
      const userId = req.user?.userId || "anonymous";

      const { datasetId } = req.query;
      const query: Record<string, any> = {
        userId: userId,
      };
      if (typeof datasetId === "string" && datasetId) {
        query.datasetId = new mongoose.Types.ObjectId(datasetId);
      }

      const sessions = await ChatSession.find(query)
        .sort({ updatedAt: -1 })
        .limit(50);
      return res.json({ sessions });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to fetch sessions" });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const userId = req.user?.userId || "anonymous";

      const rawSessionId = req.params.sessionId;
      if (typeof rawSessionId !== "string") {
        return res.status(400).json({ error: "Invalid sessionId" });
      }

      const sessionId = rawSessionId;
      const limit = Math.min(Number(req.query.limit || 50), 100);

      const session = await ChatSession.findOne({
        _id: new mongoose.Types.ObjectId(sessionId),
        userId: userId,
      });

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const messages = await Query.find({
        userId: userId,
        sessionId: new mongoose.Types.ObjectId(sessionId),
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const items = messages.reverse().map((msg: any) => ({
        _id: String(msg._id),
        question: msg.question,
        result: msg.result,
        intent: msg.intent,
        createdAt: msg.createdAt,
      }));

      return res.json({ session, messages: items });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to fetch messages" });
    }
  }

  async renameSession(req: Request, res: Response) {
    try {
      const userId = req.user?.userId || "anonymous";

      const rawSessionId = req.params.sessionId;
      const { title } = req.body || {};

      if (typeof rawSessionId !== "string") {
        return res.status(400).json({ error: "Invalid sessionId" });
      }

      const cleanedTitle = String(title || "").trim();
      if (!cleanedTitle) {
        return res.status(400).json({ error: "title is required" });
      }

      const session = await ChatSession.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(rawSessionId),
          userId: userId,
        },
        { $set: { title: cleanedTitle } },
        { new: true },
      );

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      return res.json({ session });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to rename session" });
    }
  }

  async deleteSession(req: Request, res: Response) {
    try {
      const userId = req.user?.userId || "anonymous";

      const rawSessionId = req.params.sessionId;
      if (typeof rawSessionId !== "string") {
        return res.status(400).json({ error: "Invalid sessionId" });
      }

      const sessionFilter = {
        _id: new mongoose.Types.ObjectId(rawSessionId),
        userId: userId,
      };

      const session = await ChatSession.findOne(sessionFilter);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      await Query.deleteMany({
        userId: userId,
        sessionId: session._id,
      });

      await ChatSession.deleteOne(sessionFilter);

      return res.json({ success: true });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to delete session" });
    }
  }
}
