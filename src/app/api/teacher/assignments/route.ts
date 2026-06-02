import { NextResponse } from "next/server";
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  getAssignmentSubmissions,
  requireTeacher,
  updateAssignment,
} from "@/services/teacher.service";

export async function GET(request: Request) {
  try {
    const session = await requireTeacher();
    const url = new URL(request.url);
    const assignmentId = url.searchParams.get("assignmentId");

    if (assignmentId) {
      const submissions = await getAssignmentSubmissions(session.user.id, assignmentId);
      return NextResponse.json(submissions);
    }

    const assignments = await getAssignments(session.user.id);
    return NextResponse.json(assignments);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load assignments." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireTeacher();
    const body = await request.json();
    if (!body?.courseId || !body?.title || !body?.description || !body?.dueDate) {
      return NextResponse.json({ error: "Invalid assignment payload." }, { status: 400 });
    }
    const assignment = await createAssignment(session.user.id, {
      courseId: String(body.courseId),
      title: String(body.title),
      description: String(body.description),
      dueDate: String(body.dueDate),
      attachments: Array.isArray(body.attachments) ? body.attachments.map(String) : [],
      maxScore: typeof body.maxScore === "number" ? body.maxScore : undefined,
      isPublished: typeof body.isPublished === "boolean" ? body.isPublished : undefined,
    });
    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to create assignment." }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireTeacher();
    const body = await request.json();
    if (!body?.id) {
      return NextResponse.json({ error: "Assignment id is required." }, { status: 400 });
    }
    const assignment = await updateAssignment(session.user.id, String(body.id), body);
    return NextResponse.json(assignment);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update assignment." }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireTeacher();
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const id = String(body.id ?? new URL(request.url).searchParams.get("id") ?? "");
    if (!id) {
      return NextResponse.json({ error: "Assignment id is required." }, { status: 400 });
    }
    await deleteAssignment(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to delete assignment." }, { status });
  }
}
