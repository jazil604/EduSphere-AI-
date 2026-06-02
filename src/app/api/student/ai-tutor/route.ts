import { NextResponse } from "next/server";
import { getChatHistory, requireStudent, sendTutorMessage } from "@/services/student.service";

export async function GET(request: Request) {
  try {
    const session = await requireStudent();
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId") ?? "default";
    const history = await getChatHistory(session.user.id, sessionId);
    return NextResponse.json(history);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load chat history." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireStudent();
    const body = await request.json();
    const message = body?.message ? String(body.message) : "";
    const sessionId = body?.sessionId ? String(body.sessionId) : "default";
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    const response = await sendTutorMessage(session.user.id, sessionId, message);
    return NextResponse.json({ response });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to send message." }, { status });
  }
}
