import { NextResponse } from "next/server";
import { QuizModel } from "@/lib/db/models/Quiz";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  await connectToDatabase();
  const quizzes = await QuizModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(quizzes);
}

export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const quiz = await QuizModel.create(body);
  return NextResponse.json(quiz, { status: 201 });
}
