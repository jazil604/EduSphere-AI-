import { NextResponse } from "next/server";
import { deleteUserCascade, recordAuditLog, requireAdmin, updateUserByAdmin } from "@/services/admin.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const updatedUser = await updateUserByAdmin(id, body);

    await recordAuditLog({
      userId: session.user.id,
      action: "USER_UPDATED",
      entityType: "User",
      entityId: id,
      metadata: body,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update user." }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    await deleteUserCascade(id);

    await recordAuditLog({
      userId: session.user.id,
      action: "USER_DELETED",
      entityType: "User",
      entityId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to delete user." }, { status });
  }
}

