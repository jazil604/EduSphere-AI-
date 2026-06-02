"use client";

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-3xl border border-outline-variant/50 bg-white/80 px-4 py-3 shadow-sm">
        <span className="size-2.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
        <span className="size-2.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
        <span className="size-2.5 animate-bounce rounded-full bg-primary" />
      </div>
    </div>
  );
}

