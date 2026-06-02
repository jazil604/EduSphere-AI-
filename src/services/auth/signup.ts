import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/lib/db/models/User";
import { StudentModel } from "@/lib/db/models/Student";
import { TeacherModel } from "@/lib/db/models/Teacher";
import type { UserRole } from "@/types";

type SignupInput = {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "admin">;
  educationLevel?: string;
  subjectSpecialization?: string;
};

export async function createUser(input: SignupInput) {
  await connectToDatabase();

  const normalizedEmail = input.email.toLowerCase();
  const existingUser = await UserModel.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const user = await UserModel.create({
    ...input,
    email: normalizedEmail,
    password: input.password,
    isActive: true,
    isEmailVerified: false,
    lastLogin: null,
  });

  if (input.role === "student") {
    await StudentModel.create({
      userId: user._id,
      enrolledCourses: [],
      learningPreferences: {},
      skillLevel: "beginner",
      totalPoints: 0,
      streak: 0,
    });
  }

  if (input.role === "teacher") {
    await TeacherModel.create({
      userId: user._id,
      department: "",
      bio: "",
      isApproved: false,
      qualifications: [],
    });
  }

  return user;
}
