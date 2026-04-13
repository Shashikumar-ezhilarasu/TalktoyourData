import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { requireAuth, optionalAuth } from "../middleware/auth";

const router = Router();
const chatController = new ChatController();

router.use(optionalAuth);

router.post("/sessions/ensure", (req, res) =>
  chatController.ensureSession(req, res),
);
router.get("/sessions", (req, res) => chatController.listSessions(req, res));
router.get("/sessions/:sessionId/messages", (req, res) =>
  chatController.getMessages(req, res),
);
router.patch("/sessions/:sessionId", (req, res) =>
  chatController.renameSession(req, res),
);
router.delete("/sessions/:sessionId", (req, res) =>
  chatController.deleteSession(req, res),
);

export default router;
