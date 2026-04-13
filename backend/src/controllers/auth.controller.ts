import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken";
import { User } from "../models/User.model";
import { Dataset } from "../models/Dataset.model";

const createToken = (payload: {
  userId: string;
  email: string;
  name: string;
}) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN ||
    "7d") as SignOptions["expiresIn"];
  return jwt.sign(payload, secret, { expiresIn });
};

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res
          .status(400)
          .json({ error: "name, email and password are required" });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(String(password), 10);
      const user = await User.create({
        email: normalizedEmail,
        name: String(name).trim(),
        passwordHash,
      });

      const token = createToken({
        userId: String(user._id),
        email: user.email,
        name: user.name,
      });

      return res.status(201).json({
        token,
        user: { id: String(user._id), email: user.email, name: user.name },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Registration failed" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "email and password are required" });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(String(password), user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = createToken({
        userId: String(user._id),
        email: user.email,
        name: user.name,
      });

      return res.json({
        token,
        user: { id: String(user._id), email: user.email, name: user.name },
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Login failed" });
    }
  }

  async me(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    try {
      const dbUser = await User.findOne({ email: req.user.email });
      const datasetCount = await Dataset.countDocuments({ userId: req.user.userId });

      return res.json({
        user: {
          id: req.user.userId,
          email: req.user.email,
          name: req.user.name,
          contextMemory: dbUser?.contextMemory || "",
          datasetCount,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to fetch profile" });
    }
  }

  async updateProfile(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    try {
      const { contextMemory } = req.body;
      const dbUser = await User.findOneAndUpdate(
        { email: req.user.email },
        { contextMemory },
        { new: true }
      );

      return res.json({
        message: "Profile updated successfully",
        contextMemory: dbUser?.contextMemory || "",
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to update profile", details: error.message });
    }
  }
}
