import { buildSummarySystemPrompt } from "@/lib/ai/prompts";
import { generateNimJson } from "@/lib/ai/nim-client";

export type SummaryResult = {
  summary: string;
  keyPoints: string[];
  studyNotes: string[];
  revisionQuestions: string[];
};

type SummarizeInput = {
  title?: string;
  content: string;
};

export async function summarizeLessonContent(input: SummarizeInput): Promise<SummaryResult> {
  const prompt = [
    `Title: ${input.title ?? "Lesson"}`,
    `Content: ${input.content}`,
    "Return JSON with keys summary, keyPoints, studyNotes, revisionQuestions.",
    "keyPoints and studyNotes should be short bullet-like strings.",
  ].join(" ");

  try {
    return await generateNimJson<SummaryResult>(
      [
        { role: "system", content: buildSummarySystemPrompt() },
        { role: "user", content: prompt },
      ],
      { temperature: 0.2, maxTokens: 900 },
    );
  } catch {
    const firstSentence = input.content.split(".")[0]?.trim() || "Lesson summary";
    return {
      summary: firstSentence,
      keyPoints: [firstSentence],
      studyNotes: [input.content.slice(0, 280)],
      revisionQuestions: ["What are the main ideas in this lesson?"],
    };
  }
}

