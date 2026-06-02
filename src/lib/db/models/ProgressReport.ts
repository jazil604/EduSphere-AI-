import { Schema, model, models } from "mongoose";

export type ProgressReportDocument = {
  studentId: typeof Schema.Types.ObjectId;
  courseId: typeof Schema.Types.ObjectId;
  skillScores: Map<string, number>;
  weakTopics: string[];
  strongTopics: string[];
  recommendations: string[];
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
};

const ProgressReportSchema = new Schema<ProgressReportDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    skillScores: { type: Map, of: Number, default: {} },
    weakTopics: [{ type: String, trim: true }],
    strongTopics: [{ type: String, trim: true }],
    recommendations: [{ type: String, trim: true }],
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

ProgressReportSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const ProgressReportModel =
  models.ProgressReport || model<ProgressReportDocument>("ProgressReport", ProgressReportSchema);

