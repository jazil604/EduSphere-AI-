import { NextResponse } from "next/server";
import {
  createTeacherAnnouncement,
  deleteTeacherAnnouncement,
  getTeacherAnnouncements,
  requireTeacher,
  updateTeacherAnnouncement,
} from "@/services/teacher.service";

export async function GET() {
  try {
    const session = await requireTeacher();
    const announcements = await getTeacherAnnouncements(session.user.id);
    return NextResponse.json(announcements);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load announcements." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireTeacher();
    const body = await request.json();
    if (!body?.title || !body?.content) {
      return NextResponse.json({ error: "Invalid announcement payload." }, { status: 400 });
    }
    const announcement = await createTeacherAnnouncement(session.user.id, {
      title: String(body.title),
      content: String(body.content),
      courseId: body.courseId ? String(body.courseId) : null,
      targetRoles: body.targetRoles,
      expiresAt: body.expiresAt ?? null,
    });
    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to create announcement." }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireTeacher();
    const body = await request.json();
    if (!body?.id) {
      return NextResponse.json({ error: "Announcement id is required." }, { status: 400 });
    }
    const announcement = await updateTeacherAnnouncement(session.user.id, String(body.id), body);
    return NextResponse.json(announcement);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update announcement." }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireTeacher();
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const id = String(body.id ?? new URL(request.url).searchParams.get("id") ?? "");
    if (!id) {
      return NextResponse.json({ error: "Announcement id is required." }, { status: 400 });
    }
    await deleteTeacherAnnouncement(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to delete announcement." }, { status });
  }
}

