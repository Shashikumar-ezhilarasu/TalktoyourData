import mongoose, { Schema, Document } from "mongoose";

export interface IQuery extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  datasetId: mongoose.Types.ObjectId;
  question: string;
  intent: string;
  resolvedColumns: any;
  result: any;
  cached: boolean;
  durationMs: number;
  geminiTokensUsed: number;
  createdAt: Date;
}

const QuerySchema = new Schema<IQuery>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: "ChatSession",
    required: true,
    index: true,
  },
  datasetId: { type: Schema.Types.ObjectId, ref: "Dataset", required: true },
  question: { type: String, required: true },
  intent: String,
  resolvedColumns: Schema.Types.Mixed,
  result: Schema.Types.Mixed,
  cached: { type: Boolean, default: false },
  durationMs: Number,
  geminiTokensUsed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

QuerySchema.index({ userId: 1, sessionId: 1, createdAt: -1 });
QuerySchema.index({ datasetId: 1, createdAt: -1 });

export const Query = mongoose.model<IQuery>("Query", QuerySchema);

// QueryCache model for Redis-alternative or persistent caching
export interface IQueryCache extends Document {
  cacheKey: string;
  datasetId: mongoose.Types.ObjectId;
  result: any;
  expiry: Date;
}

const QueryCacheSchema = new Schema<IQueryCache>({
  cacheKey: { type: String, required: true, unique: true },
  datasetId: { type: Schema.Types.ObjectId, ref: "Dataset" },
  result: Schema.Types.Mixed,
  expiry: { type: Date, required: true },
});

QueryCacheSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

export const QueryCache = mongoose.model<IQueryCache>(
  "QueryCache",
  QueryCacheSchema,
);
