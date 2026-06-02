import { Schema, model, models } from "mongoose";

export type CourseDocument = {
  title: string;
  description: string;
  teacherId: typeof Schema.Types.ObjectId;
  subject?: string;
  thumbnail?: string;
  lessons: typeof Schema.Types.ObjectId[];
  enrollmentCode: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const CourseSchema = new Schema<CourseDocument>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, trim: true, index: true },
    thumbnail: { type: String, trim: true },
    lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    enrollmentCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

CourseSchema.index({ teacherId: 1, isPublished: 1 });

export const CourseModel = models.Course || model<CourseDocument>("Course", CourseSchema);

