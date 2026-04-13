import { NextFunction, Request, Response } from "express";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { User } from "../models/User.model";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkJwtKey = process.env.CLERK_JWT_KEY;

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const getTokenFromRequest = (req: Request) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  const queryToken = req.query.token;
  if (typeof queryToken === "string" && queryToken.trim()) {
    return queryToken;
  }

  return null;
};

const getVerificationConfig = () => {
  if (!clerkSecretKey && !clerkJwtKey) {
    throw new Error(
      "Clerk auth is not configured. Set CLERK_SECRET_KEY and/or CLERK_JWT_KEY in backend .env",
    );
  }

  return {
    ...(clerkSecretKey ? { secretKey: clerkSecretKey } : {}),
    ...(clerkJwtKey ? { jwtKey: clerkJwtKey } : {}),
  };
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: "Authentication token missing" });
  }

  try {
    const verifiedToken = await verifyToken(token, getVerificationConfig());
    const clerkUser = await clerk.users.getUser(verifiedToken.sub);

    // Sync with MongoDB
    let mongoUser = await User.findOne({
      email: clerkUser.emailAddresses[0].emailAddress,
    });

    if (!mongoUser) {
      mongoUser = await User.create({
        email: clerkUser.emailAddresses[0].emailAddress,
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          "User",
        passwordHash: "clerk-managed", // Placeholder as Clerk handles password
      });
    }

    req.user = {
      userId: verifiedToken.sub, // Clerk User ID (string)
      email: clerkUser.emailAddresses[0].emailAddress,
      name: mongoUser.name,
    };

    return next();
  } catch (error) {
    console.error("Clerk auth error:", error);
    if (
      error instanceof Error &&
      error.message.includes("Clerk auth is not configured")
    ) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return next();
  }

  try {
    const verifiedToken = await verifyToken(token, getVerificationConfig());
    const clerkUser = await clerk.users.getUser(verifiedToken.sub);

    let mongoUser = await User.findOne({
      email: clerkUser.emailAddresses[0].emailAddress,
    });
    if (!mongoUser) {
      mongoUser = await User.create({
        email: clerkUser.emailAddresses[0].emailAddress,
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          "User",
        passwordHash: "clerk-managed",
      });
    }

    req.user = {
      userId: verifiedToken.sub,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: mongoUser.name,
    };
    return next();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Clerk auth is not configured")
    ) {
      console.error(error.message);
    }
    return next(); // Ignore auth errors for optional
  }
};
