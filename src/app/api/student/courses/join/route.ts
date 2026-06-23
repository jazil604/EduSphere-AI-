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
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (error.message === "Course not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error.message === "Course is not published yet.") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to join course." }, { status: 500 });
  }
}
