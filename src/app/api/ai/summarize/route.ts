import { NextResponse } from "next/server";
import { requireAIAccess, summarizeAIContent } from "@/services/ai.service";

export async function POST(request: Request) {
  try {
    await requireAIAccess();
    const body = await request.json();
    const content = body?.content ? String(body.content) : "";
    if (!content) {
      return NextResponse.json({ error: "Content is required." }, { status: 400 });
    }

    const summary = await summarizeAIContent({
      title: body?.title ? String(body.title) : undefined,
      content,
    });

    return NextResponse.json(summary);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to summarize content." }, { status });
  }
}

