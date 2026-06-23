import { NextResponse } from "next/server";
import { ProgressReportModel } from "@/lib/db/models/ProgressReport";
import { connectToDatabase } from "@/lib/db";
import { requireAdmin } from "@/services/admin.service";

type RouteContext = { params: Promise<{ studentId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const { studentId } = await context.params;
    const progress = await ProgressReportModel.find({ studentId }).lean();
    return NextResponse.json(progress);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load progress." }, { status });
  }
}
