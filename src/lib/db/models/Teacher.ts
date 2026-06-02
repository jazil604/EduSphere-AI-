import { Schema, model, models } from "mongoose";

export type TeacherDocument = {
  userId: typeof Schema.Types.ObjectId;
  department?: string;
  bio?: string;
  isApproved: boolean;
  qualifications: string[];
  createdAt: Date;
  updatedAt: Date;
};

const TeacherSchema = new Schema<TeacherDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    department: { type: String, trim: true, index: true },
    bio: { type: String, trim: true },
    isApproved: { type: Boolean, default: false, index: true },
    qualifications: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

export const TeacherModel = models.Teacher || model<TeacherDocument>("Teacher", TeacherSchema);
