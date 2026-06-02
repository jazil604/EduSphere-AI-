import { Schema, model, models } from "mongoose";

const SubmissionSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    score: { type: Number, required: true },
  },
  { timestamps: true },
);

export const SubmissionModel = models.Submission || model("Submission", SubmissionSchema);
