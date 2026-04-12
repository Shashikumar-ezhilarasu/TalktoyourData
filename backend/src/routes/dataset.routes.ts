import { Router } from "express";
import multer from "multer";
import { Queue } from "bullmq";
import { Dataset } from "../models/Dataset.model";
import redis, { getIsRedisAvailable } from "../config/redis";
import { ingestionWorkerLogic } from "../workers/ingestion.worker";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const dataset = await Dataset.create({
      userId,
      name: req.body.name || req.file.originalname,
      filename: req.file.originalname,
      processingStatus: "pending",
    });

    if (getIsRedisAvailable()) {
      const ingestionQueue = new Queue("ingestion", { connection: redis });
      await ingestionQueue.add("ingestion", {
        datasetId: dataset._id,
        csvData: req.file.buffer.toString(),
      });
    } else {
      // Direct call for environments without Redis fallback
      // Run in "fire and forget" background-like manner or await for demo
      ingestionWorkerLogic({
        data: { datasetId: dataset._id, csvData: req.file.buffer.toString() },
        updateProgress: async (p: number) =>
          console.log(`In-memory progress: ${p}%`),
      } as any).catch((err) =>
        console.error("In-memory ingestion failed:", err),
      );
    }

    res.status(202).json({
      message: "Upload successful, ingestion started",
      datasetId: dataset._id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/sample", async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const fs = require("fs");
    const path = require("path");
    const samplePath = path.join(__dirname, "../../samples/sales_demo.csv");
    const csvData = fs.readFileSync(samplePath, "utf8");

    const dataset = await Dataset.create({
      userId,
      name: "Demo: Sales Performance",
      filename: "sales_demo.csv",
      processingStatus: "ready", // We'll process it immediately
    });

    // Use our sync fallback worker logic
    await ingestionWorkerLogic({
      data: { datasetId: dataset._id, csvData },
      updateProgress: async (p: number) => {},
    } as any);

    res.json({ datasetId: dataset._id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });

  const datasets = await Dataset.find({ userId })
    .select("name filename uploadedAt rowCount columnCount processingStatus")
    .sort({ uploadedAt: -1 })
    .limit(100);

  res.json({ datasets });
});

router.post("/claim-legacy", async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });

  // One-time migration helper for datasets created before user ownership existed.
  const claimResult = await Dataset.updateMany(
    { userId: { $exists: false } },
    { $set: { userId } },
  );

  res.json({ claimed: claimResult.modifiedCount });
});

router.get("/:id/status", async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });

  const dataset = await Dataset.findOne({ _id: req.params.id, userId }).select(
    "processingStatus errorMessage",
  );
  if (!dataset) return res.status(404).json({ error: "Dataset not found" });

  res.json(dataset);
});

router.get("/:id", async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });

  const dataset = await Dataset.findOne({ _id: req.params.id, userId });
  if (!dataset) return res.status(404).json({ error: "Dataset not found" });

  res.json(dataset);
});

export default router;
