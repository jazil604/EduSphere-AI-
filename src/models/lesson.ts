import { Schema, model, models } from "mongoose";

const LessonSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

export const LessonModel = models.Lesson || model("Lesson", LessonSchema);
