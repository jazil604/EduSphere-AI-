import { NextResponse } from "next/server";
import { deleteCourseCascade, getAdminCourses, recordAuditLog, requireAdmin } from "@/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    const courses = await getAdminCourses();
    return NextResponse.json(courses);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load courses." }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const url = new URL(request.url);
    const courseId = String(body.id ?? url.searchParams.get("id") ?? "");

    if (!courseId) {
      return NextResponse.json({ error: "Course id is required." }, { status: 400 });
    }

    await deleteCourseCascade(courseId);

    await recordAuditLog({
      userId: session.user.id,
      action: "COURSE_DELETED",
      entityType: "Course",
      entityId: courseId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to delete course." }, { status });
  }
}

