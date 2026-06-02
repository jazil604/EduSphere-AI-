import { CourseModel, LessonModel, connectToDatabase } from "@/lib/db";
import { buildQuizSystemPrompt } from "@/lib/ai/prompts";
import { generateNimJson } from "@/lib/ai/nim-client";

export type QuizGenerationResult = {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  passingScore: number;
  questions: Array<{
    text: string;
    type: "MCQ" | "TRUE_FALSE";
    options: string[];
    correctAnswer: string;
    points: number;
    explanation: string;
  }>;
};

type GenerateQuizInput = {
  lessonId: string;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
  questionCount?: number;
};

function fallbackQuestions(topic: string, count: number) {
  return Array.from({ length: count }).map((_, index) => ({
    text: `What is a key idea about ${topic}?`,
    type: index % 2 === 0 ? ("MCQ" as const) : ("TRUE_FALSE" as const),
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: index % 2 === 0 ? "Option A" : "True",
    points: 1,
    explanation: `This question checks understanding of ${topic}.`,
  }));
}

export async function generateQuizFromTopic(input: GenerateQuizInput): Promise<QuizGenerationResult> {
  await connectToDatabase();
  const lesson = (await LessonModel.findById(input.lessonId).lean()) as any;
  if (!lesson) throw new Error("Lesson not found");
  const course = (await CourseModel.findById(lesson.courseId).lean()) as any;
  const topic = input.topic?.trim() || lesson.title;
  const difficulty = input.difficulty ?? "medium";
  const questionCount = Math.max(3, Math.min(10, input.questionCount ?? 5));

  const prompt = [
    `Lesson title: ${lesson.title}`,
    `Course title: ${course?.title ?? "Course"}`,
    `Lesson content: ${lesson.content}`,
    `Requested topic: ${topic}`,
    `Difficulty: ${difficulty}`,
    `Question count: ${questionCount}`,
    "Return JSON with keys title, description, difficulty, timeLimit, passingScore, questions.",
    "Each question must have text, type, options, correctAnswer, points, and explanation.",
    "Use only MCQ and TRUE_FALSE question types.",
  ].join(" ");

  try {
    const result = await generateNimJson<QuizGenerationResult>(
      [
        { role: "system", content: buildQuizSystemPrompt() },
        { role: "user", content: prompt },
      ],
      { temperature: 0.35, maxTokens: 1200 },
    );

    return {
      title: result.title || `${topic} Quiz`,
      description: result.description || `A quiz generated from the lesson "${lesson.title}".`,
      difficulty: result.difficulty || difficulty,
      timeLimit: result.timeLimit || (difficulty === "hard" ? 20 : difficulty === "easy" ? 10 : 15),
      passingScore: result.passingScore ?? 70,
      questions: (result.questions ?? fallbackQuestions(topic, questionCount)).slice(0, questionCount),
    };
  } catch {
    return {
      title: `${topic} Quiz`,
      description: `A quiz generated from the lesson "${lesson.title}".`,
      difficulty,
      timeLimit: difficulty === "hard" ? 20 : difficulty === "easy" ? 10 : 15,
      passingScore: 70,
      questions: fallbackQuestions(topic, questionCount),
    };
  }
}

