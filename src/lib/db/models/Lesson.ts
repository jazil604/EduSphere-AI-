import { Schema, model, models } from "mongoose";

export type LessonDocument = {
  courseId: typeof Schema.Types.ObjectId;
  title: string;
  content: string;
  videoUrl?: string;
  notes: string[];
  order: number;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
};

const LessonSchema = new Schema<LessonDocument>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    content: { type: String, required: true },
    videoUrl: { type: String, trim: true },
    notes: [{ type: String, trim: true }],
    order: { type: Number, required: true, index: true },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true },
);

LessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

export const LessonModel = models.Lesson || model<LessonDocument>("Lesson", LessonSchema);

