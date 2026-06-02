import { NextResponse } from "next/server";
import { analyzeAIProgress, requireAIAccess } from "@/services/ai.service";

export async function POST() {
  try {
    const session = await requireAIAccess();
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Only students can analyze their progress here." }, { status: 403 });
    }

    const analysis = await analyzeAIProgress(session.user.id);
    return NextResponse.json(analysis);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to analyze progress." }, { status });
  }
}

