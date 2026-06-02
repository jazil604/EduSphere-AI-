import { NextResponse } from "next/server";
import { requireStudent, submitAssignment } from "@/services/student.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireStudent();
    const { id } = await context.params;
    const body = await request.json();
    const submission = await submitAssignment(session.user.id, id, {
      content: body?.content ? String(body.content) : "",
      attachments: Array.isArray(body?.attachments) ? body.attachments.map(String) : [],
    });
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to submit assignment." }, { status });
  }
}
