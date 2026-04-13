import { Router, Request, Response } from "express";
import { queryEventBus } from "../utils/eventBus";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/:queryId", optionalAuth, (req: Request, res: Response) => {
  const rawQueryId = req.params.queryId;
  if (typeof rawQueryId !== "string") {
    return res.status(400).json({ error: "Invalid queryId" });
  }
  const queryId = rawQueryId;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const cleanup = queryEventBus.subscribe(queryId, (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  req.on("close", () => {
    cleanup();
  });
});

export default router;
