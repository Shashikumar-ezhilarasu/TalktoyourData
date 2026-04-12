import Redis from "ioredis";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export let redis!: Redis;
let isRedisAvailable = false;

try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      if (times > 3) {
        isRedisAvailable = false;
        logger.warn("Redis unavailable, falling back to in-memory processing");
        return null; // Stop retrying
      }
      return Math.min(times * 50, 2000);
    },
  });

  redis.on("connect", () => {
    isRedisAvailable = true;
    logger.info("Successfully connected to Redis");
  });

  // Suppress unhandled error logs when Redis is down
  redis.on("error", () => {
    isRedisAvailable = false;
  });
} catch (e) {
  logger.warn("Redis initialization failed, into-memory fallback active");
}

export const getIsRedisAvailable = () => isRedisAvailable;
export default redis;
