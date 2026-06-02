import { Schema, model, models } from "mongoose";

export type AssignmentSubmissionDocument = {
  assignmentId: typeof Schema.Types.ObjectId;
  studentId: typeof Schema.Types.ObjectId;
  submittedAt?: Date | null;
  attachments: string[];
  content?: string;
  score?: number | null;
  feedback?: string;
  gradedBy?: typeof Schema.Types.ObjectId | null;
  gradedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const AssignmentSubmissionSchema = new Schema<AssignmentSubmissionDocument>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    submittedAt: { type: Date, default: Date.now, index: true },
    attachments: [{ type: String, trim: true }],
    content: { type: String },
    score: { type: Number, default: null, min: 0 },
    feedback: { type: String, trim: true },
    gradedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    gradedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

AssignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const AssignmentSubmissionModel =
  models.AssignmentSubmission || model<AssignmentSubmissionDocument>("AssignmentSubmission", AssignmentSubmissionSchema);

