import { NextResponse } from "next/server";
import { CourseModel } from "@/lib/db/models/Course";
import { connectToDatabase } from "@/lib/db";
import { requireAdmin } from "@/services/admin.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const { id } = await context.params;
    const body = await request.json();
    const course = await CourseModel.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(course);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update course." }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const { id } = await context.params;
    await CourseModel.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to delete course." }, { status });
  }
}
