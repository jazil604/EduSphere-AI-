import { NextResponse } from "next/server";
import { getStudentNotifications, markNotificationRead, requireStudent } from "@/services/student.service";

export async function GET() {
  try {
    const session = await requireStudent();
    const notifications = await getStudentNotifications(session.user.id);
    return NextResponse.json(notifications);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load notifications." }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireStudent();
    const body = await request.json();
    if (!body?.id) {
      return NextResponse.json({ error: "Notification id is required." }, { status: 400 });
    }
    const notification = await markNotificationRead(session.user.id, String(body.id), Boolean(body.isRead));
    return NextResponse.json(notification);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to update notification." }, { status });
  }
}
