import { Schema, model, models } from "mongoose";

const ProgressSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true },
);

export const ProgressModel = models.Progress || model("Progress", ProgressSchema);
