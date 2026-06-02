import { NextResponse } from "next/server";
import { gradeAssignmentSubmission, requireTeacher } from "@/services/teacher.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireTeacher();
    const { id } = await context.params;
    const body = await request.json();

    if (!body?.submissionId || typeof body?.score !== "number") {
      return NextResponse.json({ error: "Invalid grading payload." }, { status: 400 });
    }

    const graded = await gradeAssignmentSubmission(session.user.id, String(body.submissionId), {
      score: body.score,
      feedback: body.feedback,
    });

    return NextResponse.json({ assignmentId: id, graded });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to grade submission." }, { status });
  }
}
