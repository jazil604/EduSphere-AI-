import { NextResponse } from "next/server";
import { requireTeacher, getTeacherStudents } from "@/services/teacher.service";

export async function GET() {
  try {
    const session = await requireTeacher();
    const students = await getTeacherStudents(session.user.id);
    return NextResponse.json(students);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load students." }, { status });
  }
}

