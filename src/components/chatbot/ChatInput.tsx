"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatInputProps = {
  onSend: (message: string) => void;
  isPending?: boolean;
};

export function ChatInput({ onSend, isPending }: ChatInputProps) {
  const [message, setMessage] = useState("");

  return (
    <form
      className="flex gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const value = message.trim();
        if (!value) return;
        onSend(value);
        setMessage("");
      }}
    >
      <Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask a question..." />
      <Button disabled={isPending || !message.trim()} type="submit">
        Send
      </Button>
    </form>
  );
}
