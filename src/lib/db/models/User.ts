import bcrypt from "bcryptjs";
import { Schema, model, models, type HydratedDocument } from "mongoose";
import type { UserRole } from "@/types";

export type UserDocument = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "teacher", "student"], required: true, index: true },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    isEmailVerified: { type: Boolean, default: false, index: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export type UserHydratedDocument = HydratedDocument<UserDocument>;
export const UserModel = models.User || model<UserDocument>("User", UserSchema);

