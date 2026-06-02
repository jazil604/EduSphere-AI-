import { ChatHistoryModel, connectToDatabase } from "@/lib/db";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import { generateNimText } from "@/lib/ai/nim-client";
import type { ChatSessionContext, NimMessage } from "@/lib/ai/config";

export type ChatHistoryItem = {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
};

export async function getChatHistory(userId: string, sessionId: string): Promise<ChatHistoryItem[]> {
  await connectToDatabase();
  const history = (await ChatHistoryModel.findOne({ userId, sessionId }).lean()) as any;
  return (history?.messages ?? [])
    .filter((message: any) => message.role === "user" || message.role === "assistant")
    .map((message: any) => ({
      role: message.role,
      content: message.content,
      timestamp: message.timestamp?.toISOString?.() ?? new Date().toISOString(),
    }));
}

export async function sendChatMessage(
  userId: string,
  sessionId: string,
  message: string,
  context?: ChatSessionContext,
) {
  await connectToDatabase();
  const history = (await ChatHistoryModel.findOneAndUpdate(
    { userId, sessionId },
    {
      $setOnInsert: { userId, sessionId, messages: [], context: context?.extraContext ?? "" },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean()) as any;

  const existingMessages = (history?.messages ?? []).filter((item: any) => item.role === "user" || item.role === "assistant");
  const messages: NimMessage[] = [
    { role: "system", content: buildChatSystemPrompt(context) },
    ...existingMessages.map((item: any) => ({ role: item.role, content: item.content })),
    { role: "user", content: message },
  ];

  const response = await generateNimText(messages, { temperature: 0.3, maxTokens: 900 });

  await ChatHistoryModel.findOneAndUpdate(
    { userId, sessionId },
    {
      $push: {
        messages: [
          { role: "user", content: message, timestamp: new Date() },
          { role: "assistant", content: response, timestamp: new Date() },
        ],
      },
      $set: { context: context?.extraContext ?? history?.context ?? "" },
    },
    { new: true, upsert: true },
  );

  return response;
}

