import { NextResponse } from "next/server";
import { getStudentQuizzes, requireStudent } from "@/services/student.service";

export async function GET() {
  try {
    const session = await requireStudent();
    const quizzes = await getStudentQuizzes(session.user.id);
    return NextResponse.json(quizzes);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load quizzes." }, { status });
  }
}
