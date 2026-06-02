import { NextResponse } from "next/server";
import { getStudentCourseDetail, leaveCourse, requireStudent } from "@/services/student.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireStudent();
    const { id } = await context.params;
    const course = await getStudentCourseDetail(session.user.id, id);
    return NextResponse.json(course);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load course." }, { status });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireStudent();
    const { id } = await context.params;
    await leaveCourse(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to leave course." }, { status });
  }
}
