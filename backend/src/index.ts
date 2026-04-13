import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db";
import { getIsRedisAvailable } from "./config/redis";
import datasetRoutes from "./routes/dataset.routes";
import queryRoutes from "./routes/query.routes";
import streamRoutes from "./routes/stream.routes";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import { requireAuth } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(
  process.env.NODE_ENV === "production" ? morgan("combined") : morgan("dev"),
);
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/stream", streamRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "up", timestamp: new Date().toISOString() });
});

// Start Server
const bootstrap = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`
🚀 DataLens Backend Running
----------------------------
Port: ${PORT}
Node: ${process.version}
Env:  ${process.env.NODE_ENV}
Redis: ${getIsRedisAvailable() ? "Active (BullMQ)" : "Unavailable (In-Memory Fallback)"}
            `);
    });
  } catch (err) {
    console.error("Bootstrap failed:", err);
  }
};

bootstrap();
