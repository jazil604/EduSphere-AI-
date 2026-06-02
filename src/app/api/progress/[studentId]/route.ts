import { NextResponse } from "next/server";
import { ProgressReportModel } from "@/lib/db/models/ProgressReport";
import { connectToDatabase } from "@/lib/db";

type RouteContext = { params: Promise<{ studentId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  await connectToDatabase();
  const { studentId } = await context.params;
  const progress = await ProgressReportModel.find({ studentId }).lean();
  return NextResponse.json(progress);
}
