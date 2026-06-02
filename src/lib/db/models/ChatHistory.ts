import { Schema, model, models } from "mongoose";

export type ChatHistoryDocument = {
  userId: typeof Schema.Types.ObjectId;
  sessionId: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  context?: string;
  createdAt: Date;
  updatedAt: Date;
};

const ChatHistorySchema = new Schema<ChatHistoryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    messages: [
      {
        role: { type: String, enum: ["system", "user", "assistant"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    context: { type: String, trim: true },
  },
  { timestamps: true },
);

ChatHistorySchema.index({ userId: 1, sessionId: 1 }, { unique: true });

export const ChatHistoryModel =
  models.ChatHistory || model<ChatHistoryDocument>("ChatHistory", ChatHistorySchema);

