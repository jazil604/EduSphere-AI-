import { NextResponse } from "next/server";
import { getTeacherAnalytics, requireTeacher } from "@/services/teacher.service";

export async function GET() {
  try {
    const session = await requireTeacher();
    const analytics = await getTeacherAnalytics(session.user.id);
    return NextResponse.json(analytics);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load analytics." }, { status });
  }
}

