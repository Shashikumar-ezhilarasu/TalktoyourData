import { GoogleGenerativeAI } from '@google/generative-ai';
import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  logger.error('GEMINI_API_KEY is missing');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export const getEmbeddingModel = () => {
  return genAI.getGenerativeModel({ model: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004' });
};

export const getFlashModel = () => {
  return genAI.getGenerativeModel({ model: process.env.GEMINI_FLASH_MODEL || 'gemini-2.0-flash' });
};

export const getProModel = () => {
  return genAI.getGenerativeModel({ model: process.env.GEMINI_PRO_MODEL || 'gemini-2.0-pro' });
};

export default genAI;
