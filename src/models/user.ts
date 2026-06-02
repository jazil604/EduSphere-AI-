import { Schema, model, models } from "mongoose";
import type { UserRole } from "@/types";

export type UserDocument = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  educationLevel?: string;
  subjectSpecialization?: string;
  approved?: boolean;
};

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "teacher", "student"], required: true },
    educationLevel: String,
    subjectSpecialization: String,
    approved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const UserModel = models.User || model<UserDocument>("User", UserSchema);
