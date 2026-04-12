import mongoose from "mongoose";
import dns from "node:dns";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const dnsServers = process.env.MONGODB_DNS_SERVERS;

  if (dnsServers) {
    const servers = dnsServers
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);

    if (servers.length > 0) {
      dns.setServers(servers);
      logger.info(
        `Using custom DNS servers for MongoDB SRV lookup: ${servers.join(", ")}`,
      );
    }
  }

  if (!uri) {
    logger.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
  };

  try {
    await mongoose.connect(uri, options);
    logger.info("Successfully connected to MongoDB Atlas");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    // Retry logic
    logger.info("Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB connection error: ${err}`);
});
