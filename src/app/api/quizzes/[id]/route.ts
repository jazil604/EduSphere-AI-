import { NextResponse } from "next/server";
import { QuizModel } from "@/lib/db/models/Quiz";
import { connectToDatabase } from "@/lib/db";
import { requireAdmin } from "@/services/admin.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const { id } = await context.params;
    const quiz = await QuizModel.findById(id).lean();
    return NextResponse.json(quiz);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load quiz." }, { status });
  }
}
