import { Schema, model, models } from "mongoose";

export type NotificationDocument = {
  userId: typeof Schema.Types.ObjectId;
  title: string;
  message: string;
  type: "course" | "assignment" | "quiz" | "announcement" | "system";
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["course", "assignment", "quiz", "announcement", "system"], required: true, index: true },
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = models.Notification || model<NotificationDocument>("Notification", NotificationSchema);
