import { NextResponse } from "next/server";
import { getStudentDashboard, requireStudent } from "@/services/student.service";

export async function GET() {
  try {
    const session = await requireStudent();
    const dashboard = await getStudentDashboard(session.user.id);
    return NextResponse.json(dashboard);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load dashboard." }, { status });
  }
}
