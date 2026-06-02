import { NextResponse } from "next/server";
import { approveTeacherProfile, recordAuditLog, requireAdmin } from "@/services/admin.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const approved = Boolean(body?.approved);

    await approveTeacherProfile(id, approved);

    await recordAuditLog({
      userId: session.user.id,
      action: approved ? "TEACHER_APPROVED" : "TEACHER_REJECTED",
      entityType: "Teacher",
      entityId: id,
      metadata: { approved },
    });

    return NextResponse.json({ ok: true, approved });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update teacher approval." }, { status });
  }
}

