"use client";

import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-3xl px-4 py-3 shadow-sm md:max-w-[78%]",
          role === "user" ? "bg-primary text-white" : "border border-outline-variant/50 bg-white/80 text-primary",
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{content}</p>
        {timestamp ? <p className={cn("mt-2 text-[11px] uppercase tracking-[0.2em]", role === "user" ? "text-white/70" : "text-on-surface-variant")}>{new Date(timestamp).toLocaleTimeString()}</p> : null}
      </div>
    </div>
  );
}

