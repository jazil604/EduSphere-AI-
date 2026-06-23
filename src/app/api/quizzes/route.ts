import { NextResponse } from "next/server";
import { QuizModel } from "@/lib/db/models/Quiz";
import { connectToDatabase } from "@/lib/db";
import { requireAdmin } from "@/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();
    const quizzes = await QuizModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(quizzes);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load quizzes." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const body = await request.json();
    const quiz = await QuizModel.create(body);
    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to create quiz." }, { status });
  }
}
