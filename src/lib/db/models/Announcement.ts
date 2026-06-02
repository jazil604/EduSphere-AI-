import { Schema, model, models } from "mongoose";
import type { UserRole } from "@/types";

export type AnnouncementDocument = {
  title: string;
  content: string;
  targetRoles: UserRole[];
  courseId?: typeof Schema.Types.ObjectId | null;
  createdBy: typeof Schema.Types.ObjectId;
  isActive: boolean;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const AnnouncementSchema = new Schema<AnnouncementDocument>(
  {
    title: { type: String, required: true, trim: true, index: true },
    content: { type: String, required: true },
    targetRoles: [{ type: String, enum: ["admin", "teacher", "student"], required: true, index: true }],
    courseId: { type: Schema.Types.ObjectId, ref: "Course", default: null, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

AnnouncementSchema.index({ isActive: 1, expiresAt: 1 });
AnnouncementSchema.index({ courseId: 1, createdAt: -1 });

export const AnnouncementModel =
  models.Announcement || model<AnnouncementDocument>("Announcement", AnnouncementSchema);
