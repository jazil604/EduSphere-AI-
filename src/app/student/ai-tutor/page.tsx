"use client";

import { useEffect, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { ChatWindow } from "@/components/chatbot/ChatWindow";
import { StudentShell } from "@/components/student/StudentShell";

function getOrCreateSessionId() {
  if (typeof window === "undefined") return "default";
  const storageKey = "student-ai-session-id";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const next = `session-${crypto.randomUUID()}`;
  window.localStorage.setItem(storageKey, next);
  return next;
}

export default function StudentAiTutorPage() {
  const [sessionId, setSessionId] = useState("default");

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  return (
    <StudentShell description="Ask subject-specific questions, request examples, and build a chat history that follows your learning journey." title="AI Tutor">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-4">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="ai-gradient flex size-11 items-center justify-center rounded-2xl text-white">
                <Bot aria-hidden className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-semibold">Your study companion</h2>
                <p className="text-sm text-on-surface-variant">Ask questions about lessons, assignments, or quiz preparation.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {["Explain this topic simply", "Generate a quick quiz", "Give me an example", "Recommend what to study next"].map((prompt) => (
                <div className="rounded-2xl border border-outline-variant/40 bg-white/70 px-4 py-3 text-sm text-on-surface-variant" key={prompt}>
                  {prompt}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <Sparkles aria-hidden className="size-5 text-primary" />
              <h3 className="font-heading text-xl font-semibold">Saved History</h3>
            </div>
            <p className="mt-2 text-sm text-on-surface-variant">Your conversations are stored by session and remain available when you return to this tutor space.</p>
          </div>
        </aside>

        <ChatWindow sessionId={sessionId} />
      </div>
    </StudentShell>
  );
}
