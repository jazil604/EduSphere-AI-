import { NextResponse } from "next/server";
import { createCourse, getTeacherCourses, requireTeacher } from "@/services/teacher.service";

export async function GET() {
  try {
    const session = await requireTeacher();
    const courses = await getTeacherCourses(session.user.id);
    return NextResponse.json(courses);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load courses." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireTeacher();
    const body = await request.json();
    if (!body?.title || !body?.description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const course = await createCourse(session.user.id, {
      title: String(body.title),
      description: String(body.description),
      subject: body.subject,
      thumbnail: body.thumbnail,
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to create course." }, { status });
  }
}

