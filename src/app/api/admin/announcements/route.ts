import { NextResponse } from "next/server";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  normalizeAnnouncementRoles,
  recordAuditLog,
  requireAdmin,
  updateAnnouncement,
} from "@/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    const announcements = await getAnnouncements();
    return NextResponse.json(announcements);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load announcements." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    if (!body?.title || !body?.content || !body?.targetRoles) {
      return NextResponse.json({ error: "Invalid announcement payload." }, { status: 400 });
    }

    const announcement = await createAnnouncement({
      title: String(body.title),
      content: String(body.content),
      targetRoles: normalizeAnnouncementRoles(body.targetRoles),
      expiresAt: body.expiresAt ?? null,
      createdBy: session.user.id,
    });

    await recordAuditLog({
      userId: session.user.id,
      action: "ANNOUNCEMENT_CREATED",
      entityType: "Announcement",
      entityId: announcement._id.toString(),
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to create announcement." }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const id = String(body?.id ?? "");

    if (!id) {
      return NextResponse.json({ error: "Announcement id is required." }, { status: 400 });
    }

    const announcement = await updateAnnouncement(id, {
      title: body.title,
      content: body.content,
      targetRoles: body.targetRoles ? normalizeAnnouncementRoles(body.targetRoles) : undefined,
      expiresAt: body.expiresAt ?? undefined,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    });

    await recordAuditLog({
      userId: session.user.id,
      action: "ANNOUNCEMENT_UPDATED",
      entityType: "Announcement",
      entityId: id,
    });

    return NextResponse.json(announcement);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update announcement." }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const url = new URL(request.url);
    const id = String(body.id ?? url.searchParams.get("id") ?? "");

    if (!id) {
      return NextResponse.json({ error: "Announcement id is required." }, { status: 400 });
    }

    await deleteAnnouncement(id);

    await recordAuditLog({
      userId: session.user.id,
      action: "ANNOUNCEMENT_DELETED",
      entityType: "Announcement",
      entityId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to delete announcement." }, { status });
  }
}

