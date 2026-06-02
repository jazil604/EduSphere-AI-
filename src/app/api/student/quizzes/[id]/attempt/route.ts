import { NextResponse } from "next/server";
import { getQuizAttempt, requireStudent, submitQuizAttempt } from "@/services/student.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireStudent();
    const { id } = await context.params;
    const quiz = await getQuizAttempt(session.user.id, id);
    return NextResponse.json(quiz);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load quiz." }, { status });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireStudent();
    const { id } = await context.params;
    const body = await request.json();
    const answers = Array.isArray(body?.answers) ? body.answers : [];
    const result = await submitQuizAttempt(session.user.id, id, {
      answers: answers.map((answer: { questionId: string; answer: string }) => ({
        questionId: String(answer.questionId),
        answer: String(answer.answer),
      })),
      timeTaken: typeof body?.timeTaken === "number" ? body.timeTaken : undefined,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to submit quiz." }, { status });
  }
}
