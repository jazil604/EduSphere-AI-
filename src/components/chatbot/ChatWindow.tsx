"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { studentFetchJson } from "@/components/student/api";
import { ChatInput } from "@/components/chatbot/ChatInput";
import { MessageBubble } from "@/components/chatbot/MessageBubble";
import { SuggestionChips } from "@/components/chatbot/SuggestionChips";
import { TypingIndicator } from "@/components/chatbot/TypingIndicator";
import { Button } from "@/components/ui/button";

type ChatEntry = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type ChatWindowProps = {
  sessionId: string;
};

const starterSuggestions = [
  "Explain this lesson simply",
  "Give me a math example",
  "Generate a quick quiz",
  "What should I study next?",
];

async function readStreamedText(response: Response, onChunk: (chunk: string) => void) {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed === "[DONE]") return fullText;
      const payload = trimmed.startsWith("data:") ? trimmed.slice(5).trim() : trimmed;
      try {
        const parsed = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
        };
        const chunk = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content ?? "";
        if (chunk) {
          fullText += chunk;
          onChunk(fullText);
        }
      } catch {
        fullText += payload;
        onChunk(fullText);
      }
    }
  }

  const trailing = buffer.trim();
  if (trailing) {
    try {
      const parsed = JSON.parse(trailing) as { choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }> };
      const chunk = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content ?? "";
      if (chunk) {
        fullText += chunk;
        onChunk(fullText);
      }
    } catch {
      fullText += trailing;
      onChunk(fullText);
    }
  }

  return fullText;
}

export function ChatWindow({ sessionId }: ChatWindowProps) {
  const queryClient = useQueryClient();
  const historyQuery = useQuery({
    queryKey: ["ai-chat-history", sessionId],
    queryFn: () => studentFetchJson<ChatEntry[]>(`/api/ai/chat?sessionId=${sessionId}`),
  });

  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setMessages(historyQuery.data ?? []);
  }, [historyQuery.data]);

  async function sendMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setMessages((current) => [
      ...current,
      { role: "user", content: trimmed, timestamp: new Date().toISOString() },
      { role: "assistant", content: "__typing__", timestamp: new Date().toISOString() },
    ]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          message: trimmed,
          stream: true,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to send message.");
      }

      let finalText = "";
      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("text/event-stream") || contentType.includes("text/plain")) {
        finalText = await readStreamedText(response, (chunk) => {
          setMessages((current) => {
            let updated = false;
            return current.map((entry) => {
              if (!updated && entry.role === "assistant" && entry.content === "__typing__") {
                updated = true;
                return { ...entry, content: chunk };
              }
              return entry;
            });
          });
        });
      } else {
        const payload = (await response.json()) as { response?: string };
        finalText = payload.response ?? "";
      }

      setMessages((current) =>
        current.map((entry) => (entry.role === "assistant" && entry.content === "__typing__" ? { ...entry, content: finalText || "I’m here to help." } : entry)),
      );
      await queryClient.invalidateQueries({ queryKey: ["ai-chat-history", sessionId] });
    } catch (error) {
      setMessages((current) => current.filter((entry) => entry.content !== "__typing__"));
      setMessages((current) => [
        ...current,
        { role: "assistant", content: error instanceof Error ? error.message : "Failed to send message.", timestamp: new Date().toISOString() },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold">AI Tutor Chat</h2>
          <p className="text-sm text-on-surface-variant">Ask questions, generate study help, and keep the conversation saved.</p>
        </div>
        <Button asChild size="sm" variant="secondary">
          <a href="/student/progress">
            <Send aria-hidden className="size-4" />
            View progress
          </a>
        </Button>
      </div>

      <div className="space-y-3">
        {historyQuery.isLoading ? (
          <div className="rounded-3xl border border-dashed border-outline-variant/60 bg-white/60 p-6 text-sm text-on-surface-variant">
            Loading conversation...
          </div>
        ) : historyQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load chat history.</div>
        ) : (
          <>
            <SuggestionChips onPick={(value) => void sendMessage(value)} suggestions={starterSuggestions} />
            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) =>
                message.content === "__typing__" ? (
                  <TypingIndicator key={`typing-${index}`} />
                ) : (
                  <MessageBubble content={message.content} key={`${message.timestamp}-${index}`} role={message.role} timestamp={message.timestamp} />
                ),
              )}
            </div>
            <div className="pt-3">
              <ChatInput isPending={isSending} onSend={(value) => void sendMessage(value)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
