import { NextResponse } from "next/server";
import { changeTeacherPassword, getTeacherProfile, requireTeacher, updateTeacherProfile } from "@/services/teacher.service";

export async function GET() {
  try {
    const session = await requireTeacher();
    const profile = await getTeacherProfile(session.user.id);
    return NextResponse.json(profile);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load profile." }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireTeacher();
    const body = await request.json();

    if (body?.action === "change-password") {
      if (!body.currentPassword || !body.newPassword) {
        return NextResponse.json({ error: "Current and new password are required." }, { status: 400 });
      }

      await changeTeacherPassword(session.user.id, String(body.currentPassword), String(body.newPassword));
      return NextResponse.json({ ok: true });
    }

    const profile = await updateTeacherProfile(session.user.id, {
      name: body?.name,
      email: body?.email,
      avatar: body?.avatar,
      department: body?.department,
      bio: body?.bio,
      qualifications: Array.isArray(body?.qualifications) ? body.qualifications : undefined,
    });

    return NextResponse.json(profile);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update profile." }, { status });
  }
}

