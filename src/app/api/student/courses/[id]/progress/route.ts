import { NextResponse } from "next/server";
import { getStudentCourseDetail, markLessonComplete, requireStudent } from "@/services/student.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireStudent();
    const { id } = await context.params;
    const course = await getStudentCourseDetail(session.user.id, id);
    return NextResponse.json(course);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load progress." }, { status });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireStudent();
    const { id } = await context.params;
    const body = await request.json();
    if (!body?.lessonId) {
      return NextResponse.json({ error: "Lesson id is required." }, { status: 400 });
    }
    await markLessonComplete(session.user.id, id, String(body.lessonId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update progress." }, { status });
  }
}
