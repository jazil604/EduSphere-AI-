import { Schema, model, models } from "mongoose";

export type CourseProgressDocument = {
  studentId: typeof Schema.Types.ObjectId;
  courseId: typeof Schema.Types.ObjectId;
  completedLessons: typeof Schema.Types.ObjectId[];
  completedQuizzes: typeof Schema.Types.ObjectId[];
  quizScores: Array<{
    quizId: typeof Schema.Types.ObjectId;
    score: number;
    percentage: number;
    submittedAt: Date;
  }>;
  lastAccessedAt: Date | null;
  timeSpentMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

const CourseProgressSchema = new Schema<CourseProgressDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    completedLessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    completedQuizzes: [{ type: Schema.Types.ObjectId, ref: "Quiz" }],
    quizScores: [
      {
        quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
        score: { type: Number, required: true, min: 0 },
        percentage: { type: Number, required: true, min: 0, max: 100 },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    lastAccessedAt: { type: Date, default: null, index: true },
    timeSpentMinutes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

CourseProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const CourseProgressModel =
  models.CourseProgress || model<CourseProgressDocument>("CourseProgress", CourseProgressSchema);
