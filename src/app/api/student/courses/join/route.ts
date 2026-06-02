import { NextResponse } from "next/server";
import { joinCourseByCode, requireStudent } from "@/services/student.service";

export async function POST(request: Request) {
  try {
    const session = await requireStudent();
    const body = await request.json();
    if (!body?.enrollmentCode) {
      return NextResponse.json({ error: "Enrollment code is required." }, { status: 400 });
    }
    const course = await joinCourseByCode(session.user.id, String(body.enrollmentCode));
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to join course." }, { status });
  }
}
