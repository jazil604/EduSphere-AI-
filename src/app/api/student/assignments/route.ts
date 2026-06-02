import { NextResponse } from "next/server";
import { getStudentAssignments, requireStudent } from "@/services/student.service";

export async function GET() {
  try {
    const session = await requireStudent();
    const assignments = await getStudentAssignments(session.user.id);
    return NextResponse.json(assignments);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load assignments." }, { status });
  }
}
