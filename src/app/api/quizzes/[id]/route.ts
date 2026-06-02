import { NextResponse } from "next/server";
import { QuizModel } from "@/lib/db/models/Quiz";
import { connectToDatabase } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  await connectToDatabase();
  const { id } = await context.params;
  const quiz = await QuizModel.findById(id).lean();
  return NextResponse.json(quiz);
}
