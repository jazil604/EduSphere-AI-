import { NextResponse } from "next/server";
import { createLesson, deleteLesson, getCourseLessons, reorderLessons, requireTeacher, updateLesson } from "@/services/teacher.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireTeacher();
    const { id } = await context.params;
    const lessons = await getCourseLessons(session.user.id, id);
    return NextResponse.json(lessons);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load lessons." }, { status });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireTeacher();
    const { id } = await context.params;
    const body = await request.json();
    const lesson = await createLesson(session.user.id, id, body);
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to create lesson." }, { status });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireTeacher();
    const { id: courseId } = await context.params;
    const body = await request.json();

    if (Array.isArray(body?.orderedLessonIds)) {
      await reorderLessons(session.user.id, courseId, body.orderedLessonIds.map(String));
      return NextResponse.json({ ok: true });
    }

    if (!body?.id) {
      return NextResponse.json({ error: "Lesson id is required." }, { status: 400 });
    }

    const lesson = await updateLesson(session.user.id, String(body.id), body);
    return NextResponse.json(lesson);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update lesson." }, { status });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireTeacher();
    const { id: courseId } = await context.params;
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const lessonId = String(body.id ?? new URL(request.url).searchParams.get("id") ?? "");
    if (!lessonId) {
      return NextResponse.json({ error: "Lesson id is required." }, { status: 400 });
    }
    await deleteLesson(session.user.id, lessonId);
    return NextResponse.json({ ok: true, courseId });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to delete lesson." }, { status });
  }
}

