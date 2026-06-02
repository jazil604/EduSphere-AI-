import { NextResponse } from "next/server";
import { getAnalyticsData, requireAdmin } from "@/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    const analytics = await getAnalyticsData();
    return NextResponse.json(analytics);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load analytics." }, { status });
  }
}

