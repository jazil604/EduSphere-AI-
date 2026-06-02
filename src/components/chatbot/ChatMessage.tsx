"use client";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
};

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={role === "user" ? "ml-auto max-w-[85%] rounded-3xl bg-primary px-4 py-3 text-white" : "max-w-[85%] rounded-3xl bg-white px-4 py-3 shadow-sm"}>
      <p className="whitespace-pre-wrap text-sm leading-6">{content}</p>
    </div>
  );
}
