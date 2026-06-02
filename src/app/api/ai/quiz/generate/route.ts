import { NextResponse } from "next/server";
import { generateAIQuiz, requireAIAccess } from "@/services/ai.service";

export async function POST(request: Request) {
  try {
    const session = await requireAIAccess();
    if (session.user.role !== "teacher" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Only teachers can generate quizzes here." }, { status: 403 });
    }

    const body = await request.json();
    if (!body?.lessonId) {
      return NextResponse.json({ error: "Lesson id is required." }, { status: 400 });
    }

    const quiz = await generateAIQuiz({
      lessonId: String(body.lessonId),
      topic: body?.topic ? String(body.topic) : undefined,
      difficulty: body?.difficulty === "easy" || body?.difficulty === "hard" ? body.difficulty : "medium",
      questionCount: typeof body?.questionCount === "number" ? body.questionCount : undefined,
    });

    return NextResponse.json(quiz);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to generate quiz." }, { status });
  }
}

