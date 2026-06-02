import { NextResponse } from "next/server";
import { changeStudentPassword, getStudentProfile, requireStudent, updateStudentProfile } from "@/services/student.service";

export async function GET() {
  try {
    const session = await requireStudent();
    const profile = await getStudentProfile(session.user.id);
    return NextResponse.json(profile);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load profile." }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireStudent();
    const body = await request.json();
    if (body?.action === "change-password") {
      if (!body?.currentPassword || !body?.newPassword) {
        return NextResponse.json({ error: "Invalid password payload." }, { status: 400 });
      }
      await changeStudentPassword(session.user.id, String(body.currentPassword), String(body.newPassword));
      return NextResponse.json({ ok: true });
    }

    const profile = await updateStudentProfile(session.user.id, {
      name: body?.name ? String(body.name) : undefined,
      email: body?.email ? String(body.email) : undefined,
      avatar: body?.avatar ? String(body.avatar) : undefined,
      skillLevel: body?.skillLevel ? String(body.skillLevel) : undefined,
      preferredSubjects: Array.isArray(body?.preferredSubjects) ? body.preferredSubjects.map(String) : undefined,
      learningStyle: body?.learningStyle ? String(body.learningStyle) : undefined,
      studyGoals: Array.isArray(body?.studyGoals) ? body.studyGoals.map(String) : undefined,
      preferredTime: body?.preferredTime ? String(body.preferredTime) : undefined,
    });
    return NextResponse.json(profile);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update profile." }, { status });
  }
}
