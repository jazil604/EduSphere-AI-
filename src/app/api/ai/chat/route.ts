import { NextResponse } from "next/server";
import { getAIChatHistory, requireAIAccess, sendAIChat } from "@/services/ai.service";

export async function GET(request: Request) {
  try {
    const session = await requireAIAccess();
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId") ?? "default";
    const history = await getAIChatHistory(session.user.id, sessionId);
    return NextResponse.json(history);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load chat history." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAIAccess();
    const body = await request.json();
    const message = body?.message ? String(body.message) : "";
    const sessionId = body?.sessionId ? String(body.sessionId) : "default";
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const response = await sendAIChat(session.user.id, sessionId, message, {
      extraContext: body?.context ? String(body.context) : "",
      subject: body?.subject ? String(body.subject) : undefined,
      courseTitle: body?.courseTitle ? String(body.courseTitle) : undefined,
      lessonTitle: body?.lessonTitle ? String(body.lessonTitle) : undefined,
      studentLevel: body?.studentLevel ? String(body.studentLevel) : undefined,
      learningPreferences: Array.isArray(body?.learningPreferences) ? body.learningPreferences.map(String) : undefined,
    });

    if (body?.stream) {
      return new Response(response, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    return NextResponse.json({ response });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to send message." }, { status });
  }
}

