import { NextResponse } from "next/server";
import { CourseModel } from "@/lib/db/models/Course";
import { connectToDatabase } from "@/lib/db";
import { requireAdmin } from "@/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();
    const courses = await CourseModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(courses);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load courses." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const body = await request.json();

    if (!body?.title || !body?.description || !body?.teacherId) {
      return NextResponse.json({ error: "Title, description, and teacherId are required." }, { status: 400 });
    }

    const course = await CourseModel.create({
      title: String(body.title),
      description: String(body.description),
      teacherId: String(body.teacherId),
      subject: body.subject ? String(body.subject) : "",
      thumbnail: body.thumbnail ? String(body.thumbnail) : "",
      lessons: Array.isArray(body.lessons) ? body.lessons : [],
      enrollmentCode: body.enrollmentCode
        ? String(body.enrollmentCode).toUpperCase()
        : `${String(body.title).replace(/[^A-Z0-9]/gi, "").slice(0, 6).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`,
      isPublished: Boolean(body.isPublished),
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to create course." }, { status });
  }
}
