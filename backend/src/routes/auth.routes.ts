import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.get("/me", requireAuth, (req, res) => authController.me(req, res));
router.put("/me/context", requireAuth, (req, res) => authController.updateProfile(req, res));

export default router;
