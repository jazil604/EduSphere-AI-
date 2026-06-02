import { NextResponse } from "next/server";
import { getTeacherAttendance, requireTeacher, upsertAttendance } from "@/services/teacher.service";

export async function GET(request: Request) {
  try {
    const session = await requireTeacher();
    const url = new URL(request.url);
    const attendance = await getTeacherAttendance(session.user.id);

    if (url.searchParams.get("format") === "csv") {
      const header = ["Date", "Student", "Course", "Status"];
      const rows = attendance.map((record) => [
        record.date,
        record.student?.name ?? "",
        record.course?.title ?? "",
        record.status,
      ]);
      const csv = [header, ...rows]
        .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
        .join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=attendance.csv",
        },
      });
    }

    return NextResponse.json(attendance);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load attendance." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireTeacher();
    const body = await request.json();
    const entries = Array.isArray(body?.entries) ? body.entries : [];
    if (!entries.length) {
      return NextResponse.json({ error: "Attendance entries are required." }, { status: 400 });
    }
    await upsertAttendance(session.user.id, entries);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to save attendance." }, { status });
  }
}

