import { CourseModel, CourseProgressModel, ProgressReportModel, StudentModel, SubmissionModel, connectToDatabase } from "@/lib/db";
import { buildProgressSystemPrompt } from "@/lib/ai/prompts";
import { generateNimJson } from "@/lib/ai/nim-client";

type ProgressAgentInput = {
  userId: string;
};

export type ProgressAgentResult = {
  overallSummary: string;
  skillScores: Record<string, number>;
  weakTopics: string[];
  strongTopics: string[];
  recommendations: string[];
  improvementTrend: Array<{ label: string; value: number }>;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function analyzeStudentProgress({ userId }: ProgressAgentInput): Promise<ProgressAgentResult> {
  await connectToDatabase();

  const student = (await StudentModel.findOne({ userId }).lean()) as any;
  const enrolledCourseIds = student?.enrolledCourses ?? [];
  const [courses, progressRecords, reports, submissions] = await Promise.all([
    CourseModel.find({ _id: { $in: enrolledCourseIds } }).select("_id title subject").lean(),
    CourseProgressModel.find({ studentId: userId }).lean(),
    ProgressReportModel.find({ studentId: userId }).lean(),
    SubmissionModel.find({ studentId: userId }).sort({ submittedAt: -1 }).lean(),
  ]);

  const courseMap = new Map((courses as any[]).map((course) => [String(course._id), course]));
  const performanceByCourse = (progressRecords as any[]).map((record) => {
    const course = courseMap.get(String(record.courseId));
    const averageScore = average((record.quizScores ?? []).map((entry: any) => Number(entry.percentage) || 0));
    return {
      courseId: String(record.courseId),
      courseTitle: course?.title ?? "Course",
      subject: course?.subject ?? "General",
      averageScore: clampScore(averageScore),
      timeSpentMinutes: Number(record.timeSpentMinutes) || 0,
    };
  });

  const overallAverage = clampScore(average(performanceByCourse.map((item) => item.averageScore)));
  const subjectScores: Record<string, number> = {};
  for (const item of performanceByCourse) {
    const key = item.subject || item.courseTitle;
    subjectScores[key] = clampScore(average([subjectScores[key] ?? 0, item.averageScore].filter((value) => value > 0)));
  }

  const weakTopics = [...new Set((reports as any[]).flatMap((report) => report.weakTopics ?? []))]
    .slice(0, 6)
    .filter(Boolean);
  const strongTopics = [...new Set((reports as any[]).flatMap((report) => report.strongTopics ?? []))]
    .slice(0, 6)
    .filter(Boolean);
  const recentTrend = (submissions as any[])
    .slice(0, 7)
    .reverse()
    .map((submission) => ({
      label: submission.submittedAt?.toISOString?.().slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      value: clampScore(Number(submission.percentage) || 0),
    }));

  const prompt = [
    `Student performance snapshot: ${JSON.stringify({
      overallAverage,
      subjectScores,
      weakTopics,
      strongTopics,
      recentTrend,
      enrolledCourses: performanceByCourse,
      streak: student?.streak ?? 0,
      totalPoints: student?.totalPoints ?? 0,
    })}`,
    "Return JSON with keys: overallSummary, skillScores, weakTopics, strongTopics, recommendations, improvementTrend.",
    "skillScores should be an object with subject names mapped to scores 0-100.",
    "recommendations should be practical and personalized.",
  ].join(" ");

  try {
    const result = await generateNimJson<ProgressAgentResult>(
      [
        { role: "system", content: buildProgressSystemPrompt() },
        { role: "user", content: prompt },
      ],
      { temperature: 0.25, maxTokens: 700 },
    );

    return {
      overallSummary: result.overallSummary ?? "Your progress is being tracked and improved.",
      skillScores: result.skillScores ?? subjectScores,
      weakTopics: result.weakTopics ?? weakTopics,
      strongTopics: result.strongTopics ?? strongTopics,
      recommendations: result.recommendations ?? [
        "Spend 15 minutes revising the weakest topic.",
        "Retake one quiz and compare your results.",
        "Use the AI tutor to ask one follow-up question after each lesson.",
      ],
      improvementTrend: result.improvementTrend ?? recentTrend,
    };
  } catch {
    return {
      overallSummary: "Your recent scores show consistent learning momentum. Focus on the weakest topics to accelerate improvement.",
      skillScores: subjectScores,
      weakTopics,
      strongTopics,
      recommendations: [
        "Review the most recent lesson notes before retaking quizzes.",
        "Practice the topics where your scores are below 70%.",
        "Use short daily sessions to improve retention.",
      ],
      improvementTrend: recentTrend,
    };
  }
}
