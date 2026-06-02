import { Schema, model, models } from "mongoose";

export type QuizDocument = {
  lessonId: typeof Schema.Types.ObjectId;
  title: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  timeLimit?: number;
  questions: typeof Schema.Types.ObjectId[];
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
};

const QuizSchema = new Schema<QuizDocument>(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium", index: true },
    timeLimit: { type: Number, default: 0 },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    passingScore: { type: Number, default: 70, min: 0, max: 100, index: true },
  },
  { timestamps: true },
);

QuizSchema.index({ lessonId: 1, createdAt: -1 });

export const QuizModel = models.Quiz || model<QuizDocument>("Quiz", QuizSchema);

