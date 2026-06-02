import { NIM_API_KEY, NIM_DEFAULT_MAX_TOKENS, NIM_DEFAULT_TEMPERATURE, NIM_ENDPOINT, NIM_MODEL, NIM_RETRY_ATTEMPTS, NIM_RETRY_BASE_DELAY_MS, type NimMessage } from "@/lib/ai/config";

type NimCompletionOptions = {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  signal?: AbortSignal;
};

type NimCompletionChoice = {
  message?: {
    content?: string;
  };
  delta?: {
    content?: string;
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(responseStatus: number) {
  return responseStatus === 429 || responseStatus >= 500;
}

function extractJsonPayload(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Empty AI response.");
  }

  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  const payload = fenced?.[1] ?? trimmed;
  const start = payload.indexOf("{");
  const end = payload.lastIndexOf("}");

  if (start >= 0 && end > start) {
    return payload.slice(start, end + 1);
  }

  throw new Error("AI response was not valid JSON.");
}

async function performRequest(messages: NimMessage[], options: NimCompletionOptions) {
  if (!NIM_API_KEY) {
    throw new Error("Missing NVIDIA_NIM_API_KEY environment variable.");
  }

  const response = await fetch(NIM_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NIM_API_KEY}`,
      "Content-Type": "application/json",
    },
    signal: options.signal,
    body: JSON.stringify({
      model: NIM_MODEL,
      messages,
      temperature: options.temperature ?? NIM_DEFAULT_TEMPERATURE,
      max_tokens: options.maxTokens ?? NIM_DEFAULT_MAX_TOKENS,
      stream: options.stream ?? false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    const error = new Error(`NVIDIA NIM request failed: ${detail}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response;
}

export async function generateNimText(messages: NimMessage[], options: NimCompletionOptions = {}) {
  let lastError: unknown;

  for (let attempt = 0; attempt < NIM_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const response = await performRequest(messages, options);
      const data = (await response.json()) as { choices?: NimCompletionChoice[] };
      return String(data.choices?.[0]?.message?.content ?? "");
    } catch (error) {
      lastError = error;
      const status = error instanceof Error ? Number((error as Error & { status?: number }).status ?? 0) : 0;
      if (attempt < NIM_RETRY_ATTEMPTS - 1 && (!status || shouldRetry(status))) {
        await sleep(NIM_RETRY_BASE_DELAY_MS * (attempt + 1));
        continue;
      }
      break;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("NIM request failed.");
}

export async function generateNimJson<T>(messages: NimMessage[], options: NimCompletionOptions = {}) {
  const text = await generateNimText(messages, options);
  const json = extractJsonPayload(text);
  return JSON.parse(json) as T;
}

export async function streamNimText(messages: NimMessage[], options: NimCompletionOptions = {}) {
  const response = await performRequest(messages, { ...options, stream: true });
  return response.body;
}

