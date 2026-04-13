import mongoose, { Document, Schema } from "mongoose";

export interface IChatSession extends Document {
  userId: string;
  datasetId?: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    datasetId: { type: Schema.Types.ObjectId, ref: "Dataset", index: true },
    title: { type: String, default: "New chat" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

ChatSessionSchema.index({ userId: 1, datasetId: 1, updatedAt: -1 });

export const ChatSession = mongoose.model<IChatSession>(
  "ChatSession",
  ChatSessionSchema,
);
