import { GoogleGenerativeAI } from "@google/generative-ai";
import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  logger.error("GEMINI_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const resolveEmbeddingModel = () => {
  const configured = (
    process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004"
  ).trim();

  // Legacy aliases can fail on newer API versions. Map to a supported model.
  if (configured === "embedding-001" || configured === "models/embedding-001") {
    logger.warn(
      `Unsupported embedding model '${configured}' configured. Falling back to 'text-embedding-004'.`,
    );
    return "text-embedding-004";
  }

  return configured;
};

export const getEmbeddingModel = () => {
  return genAI.getGenerativeModel({ model: resolveEmbeddingModel() });
};

export const getFlashModel = () => {
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_FLASH_MODEL || "gemini-2.0-flash",
  });
};

export const getProModel = () => {
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_PRO_MODEL || "gemini-2.0-pro",
  });
};

export default genAI;
