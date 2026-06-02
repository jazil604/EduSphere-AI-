import { Schema, model, models } from "mongoose";

const QuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: String, required: true },
});

const QuizSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    questions: [QuestionSchema],
  },
  { timestamps: true },
);

export const QuizModel = models.Quiz || model("Quiz", QuizSchema);
