import { auth } from "@/lib/auth/options";
import { ChatHistoryModel, CourseModel, CourseProgressModel, ProgressReportModel, StudentModel, SubmissionModel } from "@/lib/db";
import { sendChatMessage, getChatHistory } from "@/lib/ai/agents/ChatAgent";
import { analyzeStudentProgress } from "@/lib/ai/agents/ProgressAgent";
import { generateQuizFromTopic } from "@/lib/ai/agents/QuizAgent";
import { summarizeLessonContent } from "@/lib/ai/agents/SummaryAgent";
import { LessonModel } from "@/lib/db";

export async function requireAIAccess() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getAIChatHistory(userId: string, sessionId: string) {
  return getChatHistory(userId, sessionId);
}

export async function sendAIChat(
  userId: string,
  sessionId: string,
  message: string,
  context?: {
    subject?: string;
    courseTitle?: string;
    lessonTitle?: string;
    studentLevel?: string;
    learningPreferences?: string[];
    extraContext?: string;
  },
) {
  return sendChatMessage(userId, sessionId, message, context);
}

export async function analyzeAIProgress(userId: string) {
  return analyzeStudentProgress({ userId });
}

export async function generateAIQuiz(input: { lessonId: string; topic?: string; difficulty?: "easy" | "medium" | "hard"; questionCount?: number }) {
  return generateQuizFromTopic(input);
}

export async function summarizeAIContent(input: { title?: string; content: string }) {
  return summarizeLessonContent(input);
}

