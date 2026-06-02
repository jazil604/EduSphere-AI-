import { Schema, model, models } from "mongoose";

export type StudentDocument = {
  userId: typeof Schema.Types.ObjectId;
  enrolledCourses: typeof Schema.Types.ObjectId[];
  learningPreferences?: {
    preferredSubjects?: string[];
    learningStyle?: string;
    studyGoals?: string[];
    preferredTime?: string;
  };
  skillLevel?: string;
  totalPoints: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
};

const StudentSchema = new Schema<StudentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    learningPreferences: {
      preferredSubjects: [{ type: String, trim: true }],
      learningStyle: { type: String, trim: true },
      studyGoals: [{ type: String, trim: true }],
      preferredTime: { type: String, trim: true },
    },
    skillLevel: { type: String, trim: true, index: true },
    totalPoints: { type: Number, default: 0, index: true },
    streak: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export const StudentModel = models.Student || model<StudentDocument>("Student", StudentSchema);
