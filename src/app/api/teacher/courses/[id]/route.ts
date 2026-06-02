import { NextResponse } from "next/server";
import { deleteCourse, requireTeacher, updateCourse } from "@/services/teacher.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireTeacher();
    const { id } = await context.params;
    const body = await request.json();
    const course = await updateCourse(session.user.id, id, body);
    return NextResponse.json(course);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update course." }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireTeacher();
    const { id } = await context.params;
    await deleteCourse(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to delete course." }, { status });
  }
}

