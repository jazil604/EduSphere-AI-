import { generateNimText } from "@/lib/ai/nim-client";

type NimMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function askNvidiaNim(messages: NimMessage[]) {
  return generateNimText(messages);
}

