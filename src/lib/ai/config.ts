export const NIM_BASE_URL = process.env.NVIDIA_NIM_BASE_URL ?? "https://integrate.api.nvidia.com/v1";
export const NIM_ENDPOINT = process.env.NVIDIA_NIM_ENDPOINT ?? `${NIM_BASE_URL}/chat/completions`;
export const NIM_MODEL = process.env.NVIDIA_NIM_MODEL ?? "meta/llama-3.1-70b-instruct";
export const NIM_API_KEY = process.env.NVIDIA_NIM_API_KEY ?? "";

export const NIM_DEFAULT_TEMPERATURE = 0.3;
export const NIM_DEFAULT_MAX_TOKENS = 900;
export const NIM_RETRY_ATTEMPTS = 3;
export const NIM_RETRY_BASE_DELAY_MS = 350;

export type NimRole = "system" | "user" | "assistant";

export type NimMessage = {
  role: NimRole;
  content: string;
};

export type ChatSessionContext = {
  subject?: string;
  courseTitle?: string;
  lessonTitle?: string;
  studentLevel?: string;
  learningPreferences?: string[];
  extraContext?: string;
};

