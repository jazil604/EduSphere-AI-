import { NextResponse } from "next/server";
import { getAuditLogs, getAuditLogsCsv, requireAdmin } from "@/services/admin.service";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const query = {
      page: Number(url.searchParams.get("page") ?? "1"),
      limit: Number(url.searchParams.get("limit") ?? "20"),
      userId: url.searchParams.get("userId") ?? undefined,
      action: url.searchParams.get("action") ?? undefined,
      startDate: url.searchParams.get("startDate") ?? undefined,
      endDate: url.searchParams.get("endDate") ?? undefined,
    };

    if (url.searchParams.get("format") === "csv") {
      const csv = await getAuditLogsCsv(query);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=audit-logs.csv",
        },
      });
    }

    const logs = await getAuditLogs(query);
    return NextResponse.json(logs);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load audit logs." }, { status });
  }
}

