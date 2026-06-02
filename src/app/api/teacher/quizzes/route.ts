import { NextResponse } from "next/server";
import { createQuiz, deleteQuiz, getQuizResults, getTeacherQuizzes, requireTeacher, updateQuiz } from "@/services/teacher.service";

export async function GET(request: Request) {
  try {
    const session = await requireTeacher();
    const url = new URL(request.url);
    const resultsFor = url.searchParams.get("resultsFor");

    if (resultsFor) {
      const results = await getQuizResults(session.user.id, resultsFor);
      return NextResponse.json(results);
    }

    const quizzes = await getTeacherQuizzes(session.user.id);
    return NextResponse.json(quizzes);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load quizzes." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireTeacher();
    const body = await request.json();
    if (!body?.lessonId || !body?.title || !Array.isArray(body?.questions)) {
      return NextResponse.json({ error: "Invalid quiz payload." }, { status: 400 });
    }
    const quiz = await createQuiz(session.user.id, body);
    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to create quiz." }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireTeacher();
    const body = await request.json();
    if (!body?.id) {
      return NextResponse.json({ error: "Quiz id is required." }, { status: 400 });
    }
    const quiz = await updateQuiz(session.user.id, String(body.id), body);
    return NextResponse.json(quiz);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update quiz." }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireTeacher();
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const id = String(body.id ?? new URL(request.url).searchParams.get("id") ?? "");
    if (!id) {
      return NextResponse.json({ error: "Quiz id is required." }, { status: 400 });
    }
    await deleteQuiz(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to delete quiz." }, { status });
  }
}
