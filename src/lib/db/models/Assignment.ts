import { Schema, model, models } from "mongoose";

export type AssignmentDocument = {
  teacherId: typeof Schema.Types.ObjectId;
  courseId: typeof Schema.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  attachments: string[];
  maxScore: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const AssignmentSchema = new Schema<AssignmentDocument>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true, index: true },
    attachments: [{ type: String, trim: true }],
    maxScore: { type: Number, default: 100, min: 0 },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

AssignmentSchema.index({ courseId: 1, dueDate: 1 });

export const AssignmentModel = models.Assignment || model<AssignmentDocument>("Assignment", AssignmentSchema);

