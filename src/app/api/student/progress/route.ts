import { NextResponse } from "next/server";
import { getStudentProgress, requireStudent } from "@/services/student.service";

export async function GET() {
  try {
    const session = await requireStudent();
    const progress = await getStudentProgress(session.user.id);
    return NextResponse.json(progress);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load progress." }, { status });
  }
}
