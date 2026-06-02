import { Schema, model, models } from "mongoose";

const ChatHistorySchema = new Schema(
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

export const ChatHistoryModel = models.ChatHistory || model("ChatHistory", ChatHistorySchema);
