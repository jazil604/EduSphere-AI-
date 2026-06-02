import { Schema, model, models } from "mongoose";

export type SubmissionDocument = {
  studentId: typeof Schema.Types.ObjectId;
  quizId: typeof Schema.Types.ObjectId;
  answers: Array<{
    questionId: typeof Schema.Types.ObjectId;
    answer: string;
    isCorrect?: boolean;
  }>;
  score: number;
  percentage: number;
  feedback?: string;
  submittedAt: Date;
  timeTaken?: number;
  createdAt: Date;
  updatedAt: Date;
};

const SubmissionSchema = new Schema<SubmissionDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
        answer: { type: String, required: true, trim: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    score: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100, index: true },
    feedback: { type: String, trim: true },
    submittedAt: { type: Date, default: Date.now, index: true },
    timeTaken: { type: Number, default: 0 },
  },
  { timestamps: true },
);

SubmissionSchema.index({ studentId: 1, quizId: 1 }, { unique: true });

export const SubmissionModel = models.Submission || model<SubmissionDocument>("Submission", SubmissionSchema);

