import { Schema, model, models } from "mongoose";

export type QuestionType = "MCQ" | "TRUE_FALSE" | "FILL_BLANK";

export type QuestionDocument = {
  quizId: typeof Schema.Types.ObjectId;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
  createdAt: Date;
  updatedAt: Date;
};

const QuestionSchema = new Schema<QuestionDocument>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
    text: { type: String, required: true, trim: true },
    type: { type: String, enum: ["MCQ", "TRUE_FALSE", "FILL_BLANK"], required: true, index: true },
    options: [{ type: String, trim: true }],
    correctAnswer: { type: String, required: true, trim: true },
    points: { type: Number, default: 1, min: 0 },
    explanation: { type: String, trim: true },
  },
  { timestamps: true },
);

QuestionSchema.index({ quizId: 1, type: 1 });

export const QuestionModel = models.Question || model<QuestionDocument>("Question", QuestionSchema);

