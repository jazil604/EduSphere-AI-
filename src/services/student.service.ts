import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth/options";
import {
  AnnouncementModel,
  CertificateModel,
  ChatHistoryModel,
  CourseModel,
  CourseProgressModel,
  LessonModel,
  NotificationModel,
  ProgressReportModel,
  QuestionModel,
  QuizModel,
  StudentModel,
  SubmissionModel,
  UserModel,
  connectToDatabase,
} from "@/lib/db";
import { AssignmentModel } from "@/lib/db/models/Assignment";
import { AssignmentSubmissionModel } from "@/lib/db/models/AssignmentSubmission";
import { askNvidiaNim } from "@/services/ai/nvidia-nim";
import type { UserRole } from "@/types";

type ObjectIdLike = string | { toString(): string };

export type StudentDashboardResponse = {
  stats: {
    coursesEnrolled: number;
    completedQuizzes: number;
    averageScore: number;
    learningStreak: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    detail: string;
    date: string;
  }>;
  continueLearning: Array<{
    _id: string;
    title: string;
    subject: string;
    progress: number;
    lastAccessedAt: string | null;
  }>;
  upcomingDeadlines: Array<{
    _id: string;
    title: string;
    type: "assignment" | "quiz";
    dueDate: string;
    courseTitle: string;
  }>;
};

export type StudentProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLogin: string | null;
  } | null;
  profile: {
    skillLevel: string;
    totalPoints: number;
    streak: number;
    learningPreferences: {
      preferredSubjects: string[];
      learningStyle: string;
      studyGoals: string[];
      preferredTime: string;
    };
  } | null;
  accountStats: {
    enrolledCourses: number;
    completedQuizzes: number;
    averageScore: number;
    certificates: number;
  };
};

export type StudentCourseSummary = {
  _id: string;
  title: string;
  description: string;
  subject: string;
  thumbnail: string;
  enrollmentCode: string;
  teacherName: string;
  progress: number;
  lessonCount: number;
  completedLessons: number;
  isEnrolled: boolean;
};

export type StudentCourseDetail = {
  course: {
    _id: string;
    title: string;
    description: string;
    subject: string;
    thumbnail: string;
    enrollmentCode: string;
    teacherName: string;
  };
  lessons: Array<{
    _id: string;
    title: string;
    content: string;
    videoUrl: string;
    notes: string[];
    order: number;
    duration: number;
    completed: boolean;
  }>;
  progress: number;
};

export type StudentQuizSummary = {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  passingScore: number;
  courseTitle: string;
  lessonTitle: string;
  hasAttempted: boolean;
  bestScore: number;
};

export type QuizAttemptResponse = {
  quiz: {
    _id: string;
    title: string;
    description: string;
    difficulty: string;
    timeLimit: number;
    passingScore: number;
  };
  course: {
    _id: string;
    title: string;
  };
  lesson: {
    _id: string;
    title: string;
  };
  questions: Array<{
    _id: string;
    text: string;
    type: "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
    options: string[];
    points: number;
    explanation: string;
  }>;
  existingSubmission: {
    score: number;
    percentage: number;
    feedback: string;
    submittedAt: string;
    timeTaken: number;
    answers: Array<{
      questionId: string;
      answer: string;
      isCorrect: boolean;
    }>;
  } | null;
};

export type StudentAssignmentSummary = {
  _id: string;
  title: string;
  description: string;
  courseTitle: string;
  dueDate: string;
  maxScore: number;
  isPublished: boolean;
  status: "pending" | "submitted" | "graded";
  score: number | null;
  feedback: string;
  attachments: string[];
};

export type StudentProgressResponse = {
  overallProgress: number;
  courseWisePerformance: Array<{ label: string; value: number }>;
  quizPerformanceTrends: Array<{ label: string; value: number }>;
  skillMasteryLevels: Array<{ label: string; value: number }>;
  timeSpentLearning: Array<{ label: string; value: number }>;
  weakTopics: string[];
  strongTopics: string[];
  recommendations: string[];
};

export type StudentCertificateItem = {
  _id: string;
  title: string;
  certificateId: string;
  score: number;
  issuedAt: string;
  courseTitle: string;
  url: string;
};

export type StudentNotificationItem = {
  _id: string;
  title: string;
  message: string;
  type: "course" | "assignment" | "quiz" | "announcement" | "system";
  isRead: boolean;
  createdAt: string;
};

export type ChatHistoryItem = {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
};

function toId(value: ObjectIdLike) {
  return typeof value === "string" ? value : value.toString();
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function startOfDay(value: Date) {
  const copy = new Date(value);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function safeDate(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function lessonProgressPercent(lessonCount: number, completedCount: number) {
  if (!lessonCount) return 0;
  return Math.round((completedCount / lessonCount) * 100);
}

export async function requireStudent() {
  const session = await auth();
  if (!session?.user || session.user.role !== "student") {
    throw new Error("Unauthorized");
  }
  return session;
}

async function getStudentRecord(userId: string) {
  const [user, student] = await Promise.all([
    UserModel.findById(userId).lean(),
    StudentModel.findOne({ userId }).lean(),
  ]);
  return { user: user as any, student: student as any };
}

async function getOrCreateCourseProgress(studentId: string, courseId: string) {
  const progress = (await CourseProgressModel.findOneAndUpdate(
    { studentId, courseId },
    { $setOnInsert: { completedLessons: [], completedQuizzes: [], quizScores: [], lastAccessedAt: new Date(), timeSpentMinutes: 0 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean()) as any;
  return progress;
}

async function syncCertificate(userId: string, courseId: string) {
  const course = (await CourseModel.findById(courseId).lean()) as any;
  if (!course) return null;
  const lessons = (await LessonModel.find({ courseId }).select("_id").lean()) as any[];
  const progress = (await CourseProgressModel.findOne({ studentId: userId, courseId }).lean()) as any;
  if (!progress || lessons.length === 0) return null;

  const allLessonsComplete = progress.completedLessons?.length >= lessons.length;
  const quizAverage = avg((progress.quizScores ?? []).map((item: any) => Number(item.percentage) || 0));
  if (!allLessonsComplete || quizAverage < 70) return null;

  const certificateId = `CERT-${toId(userId).slice(-6).toUpperCase()}-${toId(courseId).slice(-4).toUpperCase()}`;
  const existing = (await CertificateModel.findOne({ studentId: userId, courseId }).lean()) as any;
  if (existing) return existing;

  return CertificateModel.create({
    studentId: userId,
    courseId,
    certificateId,
    title: `${course.title} Certificate`,
    issuedAt: new Date(),
    score: quizAverage,
    url: "",
  });
}

async function createNotification(userId: string, payload: { title: string; message: string; type: StudentNotificationItem["type"]; metadata?: Record<string, unknown> }) {
  return NotificationModel.create({
    userId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    isRead: false,
    metadata: payload.metadata ?? {},
  });
}

export async function getStudentDashboard(userId: string): Promise<StudentDashboardResponse> {
  await connectToDatabase();
  const { student } = await getStudentRecord(userId);
  const enrolledCourseIds = student?.enrolledCourses ?? [];
  const courses = (await CourseModel.find({ _id: { $in: enrolledCourseIds } }).lean()) as any[];
  const lessons = (await LessonModel.find({ courseId: { $in: enrolledCourseIds } }).lean()) as any[];
  const quizIds = (await QuizModel.find({ lessonId: { $in: lessons.map((lesson) => lesson._id) } }).select("_id").lean()) as any[];
  const submissions = (await SubmissionModel.find({ studentId: userId }).sort({ submittedAt: -1 }).populate("quizId", "title").lean()) as any[];
  const assignmentSubmissions = (await AssignmentSubmissionModel.find({ studentId: userId }).sort({ submittedAt: -1 }).populate("assignmentId", "title courseId").lean()) as any[];
  const progressRecords = (await CourseProgressModel.find({ studentId: userId }).lean()) as any[];
  const notifications = (await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(10).lean()) as any[];

  const recentActivity = [
    ...submissions.slice(0, 5).map((submission) => ({
      id: toId(submission._id),
      title: (submission.quizId as { title?: string } | undefined)?.title ?? "Quiz submitted",
      detail: `${submission.percentage ?? 0}% on quiz`,
      date: submission.submittedAt?.toISOString?.() ?? new Date().toISOString(),
    })),
    ...assignmentSubmissions.slice(0, 5).map((submission) => ({
      id: toId(submission._id),
      title: (submission.assignmentId as { title?: string } | undefined)?.title ?? "Assignment submitted",
      detail: submission.score != null ? `Graded ${submission.score} points` : "Submission pending grading",
      date: submission.submittedAt?.toISOString?.() ?? new Date().toISOString(),
    })),
    ...notifications.slice(0, 5).map((notification) => ({
      id: toId(notification._id),
      title: notification.title,
      detail: notification.message,
      date: notification.createdAt?.toISOString?.() ?? new Date().toISOString(),
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  const continueLearning = courses.map((course) => {
    const progress = progressRecords.find((record) => toId(record.courseId) === toId(course._id)) ?? null;
    const completedLessons = progress?.completedLessons?.length ?? 0;
    const lessonCount = lessons.filter((lesson) => toId(lesson.courseId) === toId(course._id)).length;
    return {
      _id: toId(course._id),
      title: course.title,
      subject: course.subject ?? "",
      progress: lessonProgressPercent(lessonCount, completedLessons),
      lastAccessedAt: progress?.lastAccessedAt ? progress.lastAccessedAt.toISOString() : null,
    };
  });

  const upcomingAssignments = (await AssignmentModel.find({ courseId: { $in: enrolledCourseIds }, isPublished: true, dueDate: { $gte: new Date() } })
    .sort({ dueDate: 1 })
    .limit(5)
    .populate("courseId", "title")
    .lean()) as any[];

  const upcomingQuizzes = (await QuizModel.find({ lessonId: { $in: lessons.map((lesson) => lesson._id) } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({ path: "lessonId", populate: { path: "courseId", select: "title" } })
    .lean()) as any[];

  const upcomingDeadlines = [
    ...upcomingAssignments.map((assignment) => ({
      _id: toId(assignment._id),
      title: assignment.title,
      type: "assignment" as const,
      dueDate: assignment.dueDate.toISOString(),
      courseTitle: (assignment.courseId as { title?: string } | undefined)?.title ?? "Course",
    })),
    ...upcomingQuizzes.map((quiz) => ({
      _id: toId(quiz._id),
      title: quiz.title,
      type: "quiz" as const,
      dueDate: quiz.createdAt.toISOString(),
      courseTitle: ((quiz.lessonId as { courseId?: { title?: string } } | undefined)?.courseId as { title?: string } | undefined)?.title ?? "Course",
    })),
  ].slice(0, 5);

  const averageScore = avg(submissions.map((submission) => Number(submission.percentage) || 0));

  return {
    stats: {
      coursesEnrolled: enrolledCourseIds.length,
      completedQuizzes: submissions.length,
      averageScore,
      learningStreak: student?.streak ?? 0,
    },
    recentActivity,
    continueLearning,
    upcomingDeadlines,
  };
}

export async function getStudentProfile(userId: string): Promise<StudentProfileResponse> {
  await connectToDatabase();
  const [user, student, submissions, certificates] = await Promise.all([
    UserModel.findById(userId).lean(),
    StudentModel.findOne({ userId }).lean(),
    SubmissionModel.find({ studentId: userId }).lean(),
    CertificateModel.countDocuments({ studentId: userId }),
  ]);

  return {
    user: user
      ? {
          id: toId((user as any)._id),
          name: (user as any).name,
          email: (user as any).email,
          avatar: (user as any).avatar ?? "",
          isActive: (user as any).isActive,
          isEmailVerified: (user as any).isEmailVerified,
          lastLogin: (user as any).lastLogin ? (user as any).lastLogin.toISOString() : null,
        }
      : null,
    profile: student
      ? {
          skillLevel: (student as any).skillLevel ?? "beginner",
          totalPoints: (student as any).totalPoints ?? 0,
          streak: (student as any).streak ?? 0,
          learningPreferences: {
            preferredSubjects: (student as any).learningPreferences?.preferredSubjects ?? [],
            learningStyle: (student as any).learningPreferences?.learningStyle ?? "",
            studyGoals: (student as any).learningPreferences?.studyGoals ?? [],
            preferredTime: (student as any).learningPreferences?.preferredTime ?? "",
          },
        }
      : null,
    accountStats: {
      enrolledCourses: (student as any)?.enrolledCourses?.length ?? 0,
      completedQuizzes: submissions.length,
      averageScore: avg(submissions.map((submission) => Number((submission as any).percentage) || 0)),
      certificates,
    },
  };
}

export async function updateStudentProfile(
  userId: string,
  input: {
    name?: string;
    email?: string;
    avatar?: string;
    skillLevel?: string;
    preferredSubjects?: string[];
    learningStyle?: string;
    studyGoals?: string[];
    preferredTime?: string;
  },
) {
  await connectToDatabase();
  const userUpdate: Record<string, unknown> = {};
  const studentUpdate: Record<string, unknown> = {};

  if (typeof input.name === "string") userUpdate.name = input.name.trim();
  if (typeof input.email === "string") userUpdate.email = input.email.toLowerCase().trim();
  if (typeof input.avatar === "string") userUpdate.avatar = input.avatar.trim();
  if (typeof input.skillLevel === "string") studentUpdate.skillLevel = input.skillLevel;
  if (Array.isArray(input.preferredSubjects)) studentUpdate["learningPreferences.preferredSubjects"] = input.preferredSubjects;
  if (typeof input.learningStyle === "string") studentUpdate["learningPreferences.learningStyle"] = input.learningStyle;
  if (Array.isArray(input.studyGoals)) studentUpdate["learningPreferences.studyGoals"] = input.studyGoals;
  if (typeof input.preferredTime === "string") studentUpdate["learningPreferences.preferredTime"] = input.preferredTime;

  await Promise.all([
    Object.keys(userUpdate).length ? UserModel.findByIdAndUpdate(userId, userUpdate, { new: true }) : null,
    StudentModel.findOneAndUpdate({ userId }, studentUpdate, { new: true, upsert: true, setDefaultsOnInsert: true }),
  ]);

  return getStudentProfile(userId);
}

export async function changeStudentPassword(userId: string, currentPassword: string, newPassword: string) {
  await connectToDatabase();
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");
  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) throw new Error("Current password is incorrect");
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
}

export async function getAvailableCourses(userId: string) {
  await connectToDatabase();
  const { student } = await getStudentRecord(userId);
  const enrolled = new Set((student?.enrolledCourses ?? []).map((courseId: ObjectIdLike) => toId(courseId)));
  const progressRecords = (await CourseProgressModel.find({ studentId: userId }).lean()) as any[];
  const allCourseIds = (await CourseModel.find({ isPublished: true }).select("_id").lean()) as any[];
  const lessons = (await LessonModel.find({ courseId: { $in: allCourseIds.map((course) => course._id) } }).select("courseId").lean()) as any[];
  const lessonCounts = new Map<string, number>();
  lessons.forEach((lesson) => {
    const key = toId(lesson.courseId);
    lessonCounts.set(key, (lessonCounts.get(key) ?? 0) + 1);
  });
  const courses = (await CourseModel.find({ isPublished: true }).populate("teacherId", "name").sort({ createdAt: -1 }).lean()) as any[];

  return courses.map((course) => {
    const progressRecord = progressRecords.find((record) => toId(record.courseId) === toId(course._id));
    const completedLessons = progressRecord?.completedLessons?.length ?? 0;
    const lessonCount = lessonCounts.get(toId(course._id)) ?? 0;
    return {
      _id: toId(course._id),
      title: course.title,
      description: course.description,
      subject: course.subject ?? "",
      thumbnail: course.thumbnail ?? "",
      enrollmentCode: course.enrollmentCode,
      teacherName: (course.teacherId as { name?: string } | undefined)?.name ?? "Teacher",
      progress: lessonProgressPercent(lessonCount, completedLessons),
      lessonCount,
      completedLessons,
      isEnrolled: enrolled.has(toId(course._id)),
    } satisfies StudentCourseSummary;
  });
}

export async function getStudentCourses(userId: string) {
  await connectToDatabase();
  const { student } = await getStudentRecord(userId);
  const courseIds = student?.enrolledCourses ?? [];
  const courses = (await CourseModel.find({ _id: { $in: courseIds } }).populate("teacherId", "name").lean()) as any[];

  return Promise.all(
    courses.map(async (course) => {
      const lessonCount = await LessonModel.countDocuments({ courseId: course._id });
      const progress = (await CourseProgressModel.findOne({ studentId: userId, courseId: course._id }).lean()) as any;
      const completedLessons = progress?.completedLessons?.length ?? 0;
      return {
        _id: toId(course._id),
        title: course.title,
        description: course.description,
        subject: course.subject ?? "",
        thumbnail: course.thumbnail ?? "",
        enrollmentCode: course.enrollmentCode,
        teacherName: (course.teacherId as { name?: string } | undefined)?.name ?? "Teacher",
        progress: lessonProgressPercent(lessonCount, completedLessons),
        lessonCount,
        completedLessons,
        isEnrolled: true,
      } satisfies StudentCourseSummary;
    }),
  );
}

export async function joinCourseByCode(userId: string, enrollmentCode: string) {
  await connectToDatabase();
  const course = (await CourseModel.findOne({ enrollmentCode: enrollmentCode.trim().toUpperCase(), isPublished: true }).lean()) as any;
  if (!course) throw new Error("Course not found");
  await StudentModel.findOneAndUpdate(
    { userId },
    { $addToSet: { enrolledCourses: course._id } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  await CourseProgressModel.findOneAndUpdate(
    { studentId: userId, courseId: course._id },
    { $setOnInsert: { completedLessons: [], completedQuizzes: [], quizScores: [], lastAccessedAt: new Date(), timeSpentMinutes: 0 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  await createNotification(userId, {
    title: "Course joined",
    message: `You joined ${course.title}.`,
    type: "course",
    metadata: { courseId: toId(course._id) },
  });
  return course;
}

export async function leaveCourse(userId: string, courseId: string) {
  await connectToDatabase();
  await StudentModel.findOneAndUpdate({ userId }, { $pull: { enrolledCourses: courseId } }, { new: true });
  await CourseProgressModel.deleteOne({ studentId: userId, courseId });
}

export async function getStudentCourseDetail(userId: string, courseId: string): Promise<StudentCourseDetail> {
  await connectToDatabase();
  const course = (await CourseModel.findOne({ _id: courseId, isPublished: true }).populate("teacherId", "name").lean()) as any;
  if (!course) throw new Error("Course not found");
  const progress = (await getOrCreateCourseProgress(userId, courseId)) as any;
  const lessons = (await LessonModel.find({ courseId }).sort({ order: 1 }).lean()) as any[];
  const completedLessons = new Set((progress.completedLessons ?? []).map((id: ObjectIdLike) => toId(id)));

  return {
    course: {
      _id: toId(course._id),
      title: course.title,
      description: course.description,
      subject: course.subject ?? "",
      thumbnail: course.thumbnail ?? "",
      enrollmentCode: course.enrollmentCode,
      teacherName: (course.teacherId as { name?: string } | undefined)?.name ?? "Teacher",
    },
    lessons: lessons.map((lesson) => ({
      _id: toId(lesson._id),
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl ?? "",
      notes: lesson.notes ?? [],
      order: lesson.order,
      duration: lesson.duration ?? 0,
      completed: completedLessons.has(toId(lesson._id)),
    })),
    progress: lessonProgressPercent(lessons.length, completedLessons.size),
  };
}

export async function markLessonComplete(userId: string, courseId: string, lessonId: string) {
  await connectToDatabase();
  const course = await CourseModel.findById(courseId).lean();
  if (!course) throw new Error("Course not found");
  const lesson = (await LessonModel.findOne({ _id: lessonId, courseId }).lean()) as any;
  if (!lesson) throw new Error("Lesson not found");

  const progress = await getOrCreateCourseProgress(userId, courseId);
  const completedLessons = new Set((progress.completedLessons ?? []).map((id: ObjectIdLike) => toId(id)));
  completedLessons.add(lessonId);
  await CourseProgressModel.findOneAndUpdate(
    { studentId: userId, courseId },
    {
      $set: {
        completedLessons: Array.from(completedLessons),
        lastAccessedAt: new Date(),
      },
    },
    { new: true },
  );

  await StudentModel.findOneAndUpdate({ userId }, { $inc: { totalPoints: 5, streak: 1 } });
  await createNotification(userId, {
    title: "Lesson completed",
    message: `You completed ${lesson.title}.`,
    type: "course",
    metadata: { courseId, lessonId },
  });

  await syncCertificate(userId, courseId);
}

export async function getStudentQuizzes(userId: string): Promise<StudentQuizSummary[]> {
  await connectToDatabase();
  const { student } = await getStudentRecord(userId);
  const courseIds = student?.enrolledCourses ?? [];
  const lessons = (await LessonModel.find({ courseId: { $in: courseIds } }).select("_id courseId title").lean()) as any[];
  const courses = (await CourseModel.find({ _id: { $in: courseIds } }).select("_id title").lean()) as unknown as Array<{
    _id: ObjectIdLike;
    title: string;
  }>;
  const courseMap = new Map<string, { title: string }>(courses.map((course) => [toId(course._id), { title: course.title }]));
  const quizzes = (await QuizModel.find({ lessonId: { $in: lessons.map((lesson) => lesson._id) } }).populate("lessonId", "title courseId").lean()) as any[];
  const submissions = (await SubmissionModel.find({ studentId: userId }).lean()) as any[];

  return quizzes.map((quiz) => {
    const relatedSubmissions = submissions.filter((submission) => toId(submission.quizId) === toId(quiz._id));
    const bestScore = relatedSubmissions.length ? Math.max(...relatedSubmissions.map((submission) => Number(submission.percentage) || 0)) : 0;
    const lesson = quiz.lessonId as { title?: string; courseId?: ObjectIdLike } | undefined;
    const course = lesson?.courseId ? courseMap.get(toId(lesson.courseId)) : null;
    return {
      _id: toId(quiz._id),
      title: quiz.title,
      description: quiz.description ?? "",
      difficulty: quiz.difficulty ?? "medium",
      timeLimit: quiz.timeLimit ?? 0,
      passingScore: quiz.passingScore ?? 70,
      courseTitle: course?.title ?? "Course",
      lessonTitle: lesson?.title ?? "Lesson",
      hasAttempted: relatedSubmissions.length > 0,
      bestScore,
    };
  });
}

export async function getQuizAttempt(userId: string, quizId: string): Promise<QuizAttemptResponse> {
  await connectToDatabase();
  const quiz = (await QuizModel.findById(quizId).lean()) as any;
  if (!quiz) throw new Error("Quiz not found");
  const lesson = (await LessonModel.findById(quiz.lessonId).populate("courseId", "title").lean()) as any;
  if (!lesson) throw new Error("Lesson not found");
  const lessonCourse = lesson.courseId as { _id?: ObjectIdLike; title?: string } | undefined;
  const questions = (await QuestionModel.find({ _id: { $in: quiz.questions } }).sort({ createdAt: 1 }).lean()) as any[];
  const existing = (await SubmissionModel.findOne({ studentId: userId, quizId }).lean()) as any;
  return {
    quiz: {
      _id: toId(quiz._id),
      title: quiz.title,
      description: quiz.description ?? "",
      difficulty: quiz.difficulty ?? "medium",
      timeLimit: quiz.timeLimit ?? 0,
      passingScore: quiz.passingScore ?? 70,
    },
    course: {
      _id: toId(lessonCourse?._id ?? lesson.courseId ?? ""),
      title: lessonCourse?.title ?? "Course",
    },
    lesson: {
      _id: toId(lesson._id),
      title: lesson.title,
    },
    questions: questions.map((question) => ({
      _id: toId(question._id),
      text: question.text,
      type: question.type,
      options: question.options ?? [],
      points: question.points ?? 1,
      explanation: question.explanation ?? "",
    })),
    existingSubmission: existing
      ? {
          score: existing.score,
          percentage: existing.percentage,
          feedback: existing.feedback ?? "",
          submittedAt: existing.submittedAt.toISOString(),
          timeTaken: existing.timeTaken ?? 0,
          answers: (existing.answers ?? []).map((answer: any) => ({
            questionId: toId(answer.questionId),
            answer: String(answer.answer ?? ""),
            isCorrect: Boolean(answer.isCorrect),
          })),
        }
      : null,
  };
}

export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  input: {
    answers: Array<{ questionId: string; answer: string }>;
    timeTaken?: number;
  },
) {
  await connectToDatabase();
  const quiz = (await QuizModel.findById(quizId).lean()) as any;
  if (!quiz) throw new Error("Quiz not found");
  const lesson = (await LessonModel.findById(quiz.lessonId).lean()) as any;
  if (!lesson) throw new Error("Lesson not found");
  const questions = (await QuestionModel.find({ _id: { $in: quiz.questions } }).lean()) as any[];
  const questionMap = new Map(questions.map((question) => [toId(question._id), question]));

  const scoredAnswers = input.answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    const isCorrect = question ? String(question.correctAnswer).trim().toLowerCase() === String(answer.answer).trim().toLowerCase() : false;
    return {
      questionId: answer.questionId,
      answer: answer.answer,
      isCorrect,
    };
  });

  const totalPoints = questions.reduce((sum, question) => sum + (question.points ?? 1), 0);
  const earnedPoints = scoredAnswers.reduce((sum, answer) => {
    const question = questionMap.get(answer.questionId);
    return sum + (answer.isCorrect ? (question?.points ?? 1) : 0);
  }, 0);
  const score = earnedPoints;
  const percentage = totalPoints ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  const submission = await SubmissionModel.findOneAndUpdate(
    { studentId: userId, quizId },
    {
      answers: scoredAnswers,
      score,
      percentage,
      feedback: percentage >= (quiz.passingScore ?? 70) ? "Great work!" : "Review the lesson and try again.",
      submittedAt: new Date(),
      timeTaken: input.timeTaken ?? 0,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();

  const courseId = toId(lesson.courseId);
  const progress = await getOrCreateCourseProgress(userId, courseId);
  const updatedScores = [...(progress.quizScores ?? []), { quizId, score, percentage, submittedAt: new Date() }];
  await CourseProgressModel.findOneAndUpdate(
    { studentId: userId, courseId },
    {
      $addToSet: { completedQuizzes: quizId },
      $set: {
        lastAccessedAt: new Date(),
        quizScores: updatedScores,
      },
      $inc: { timeSpentMinutes: Math.ceil((input.timeTaken ?? 0) / 60) },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await StudentModel.findOneAndUpdate({ userId }, { $inc: { totalPoints: earnedPoints } });
  await createNotification(userId, {
    title: "Quiz submitted",
    message: `You scored ${percentage}% on ${quiz.title}.`,
    type: "quiz",
    metadata: { quizId },
  });
  await syncCertificate(userId, courseId);

  return {
    submission: submission ?? null,
    score,
    percentage,
    passed: percentage >= (quiz.passingScore ?? 70),
  };
}

export async function getStudentAssignments(userId: string): Promise<StudentAssignmentSummary[]> {
  await connectToDatabase();
  const { student } = await getStudentRecord(userId);
  const courseIds = student?.enrolledCourses ?? [];
  const assignments = (await AssignmentModel.find({ courseId: { $in: courseIds }, isPublished: true }).populate("courseId", "title").sort({ dueDate: 1 }).lean()) as any[];
  const submissions = (await AssignmentSubmissionModel.find({ studentId: userId }).lean()) as any[];

  return assignments.map((assignment) => {
    const submission = submissions.find((item) => toId(item.assignmentId) === toId(assignment._id));
    return {
      _id: toId(assignment._id),
      title: assignment.title,
      description: assignment.description,
      courseTitle: (assignment.courseId as { title?: string } | undefined)?.title ?? "Course",
      dueDate: assignment.dueDate.toISOString(),
      maxScore: assignment.maxScore ?? 100,
      isPublished: assignment.isPublished,
      status: submission ? (submission.score != null ? "graded" : "submitted") : "pending",
      score: submission?.score ?? null,
      feedback: submission?.feedback ?? "",
      attachments: assignment.attachments ?? [],
    };
  });
}

export async function submitAssignment(
  userId: string,
  assignmentId: string,
  input: { content?: string; attachments?: string[] },
) {
  await connectToDatabase();
  const assignment = (await AssignmentModel.findById(assignmentId).lean()) as any;
  if (!assignment) throw new Error("Assignment not found");
  const submission = await AssignmentSubmissionModel.findOneAndUpdate(
    { studentId: userId, assignmentId },
    {
      content: input.content ?? "",
      attachments: input.attachments ?? [],
      submittedAt: new Date(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  await createNotification(userId, {
    title: "Assignment submitted",
    message: `You submitted ${assignment.title}.`,
    type: "assignment",
    metadata: { assignmentId },
  });
  return submission;
}

export async function getStudentProgress(userId: string): Promise<StudentProgressResponse> {
  await connectToDatabase();
  const { student } = await getStudentRecord(userId);
  const courseIds = student?.enrolledCourses ?? [];
  const courses = (await CourseModel.find({ _id: { $in: courseIds } }).select("_id title").lean()) as unknown as Array<{
    _id: ObjectIdLike;
    title: string;
  }>;
  const courseMap = new Map<string, string>(courses.map((course) => [toId(course._id), course.title]));
  const reports = (await ProgressReportModel.find({ studentId: userId, courseId: { $in: courseIds } }).lean()) as any[];
  const progressRecords = (await CourseProgressModel.find({ studentId: userId, courseId: { $in: courseIds } }).lean()) as any[];
  const submissions = (await SubmissionModel.find({ studentId: userId }).sort({ submittedAt: -1 }).lean()) as any[];

  const courseWisePerformance = progressRecords.map((record) => ({
    label: courseMap.get(toId(record.courseId)) ?? String(record.courseId),
    value: avg((record.quizScores ?? []).map((entry: any) => Number(entry.percentage) || 0)),
  }));

  const quizPerformanceTrends = submissions.map((submission) => ({
    label: submission.submittedAt.toISOString().slice(0, 10),
    value: Number(submission.percentage) || 0,
  }));

  const skillMasteryLevels = reports.length
    ? Object.entries(reports[0].skillScores ?? {}).map(([label, value]) => ({ label, value: Number(value) || 0 }))
    : [];

  const timeSpentLearning = progressRecords.map((record) => ({
    label: courseMap.get(toId(record.courseId)) ?? String(record.courseId),
    value: Number(record.timeSpentMinutes) || 0,
  }));

  const weakTopics = reports.flatMap((report) => report.weakTopics ?? []).slice(0, 5);
  const strongTopics = reports.flatMap((report) => report.strongTopics ?? []).slice(0, 5);
  const recommendations = reports.flatMap((report) => report.recommendations ?? []).slice(0, 5);

  return {
    overallProgress: courseWisePerformance.length ? avg(courseWisePerformance.map((item) => item.value)) : 0,
    courseWisePerformance,
    quizPerformanceTrends,
    skillMasteryLevels,
    timeSpentLearning,
    weakTopics,
    strongTopics,
    recommendations,
  };
}

export async function getStudentCertificates(userId: string): Promise<StudentCertificateItem[]> {
  await connectToDatabase();
  const certificates = (await CertificateModel.find({ studentId: userId }).populate("courseId", "title").sort({ issuedAt: -1 }).lean()) as any[];
  return certificates.map((certificate) => ({
    _id: toId(certificate._id),
    title: certificate.title,
    certificateId: certificate.certificateId,
    score: certificate.score,
    issuedAt: certificate.issuedAt.toISOString(),
    courseTitle: (certificate.courseId as { title?: string } | undefined)?.title ?? "Course",
    url: certificate.url ?? "",
  }));
}

export async function getStudentNotifications(userId: string): Promise<StudentNotificationItem[]> {
  await connectToDatabase();
  const notifications = (await NotificationModel.find({ userId }).sort({ createdAt: -1 }).lean()) as any[];
  const announcements = (await AnnouncementModel.find({ targetRoles: { $in: ["student"] }, isActive: true }).sort({ createdAt: -1 }).limit(5).lean()) as any[];

  const announcementNotifications = announcements.map((announcement) => ({
    _id: `announcement-${toId(announcement._id)}`,
    title: announcement.title,
    message: announcement.content,
    type: "announcement" as const,
    isRead: false,
    createdAt: announcement.createdAt.toISOString(),
  }));

  return [
    ...notifications.map((notification) => ({
      _id: toId(notification._id),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    })),
    ...announcementNotifications,
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function markNotificationRead(userId: string, notificationId: string, isRead: boolean) {
  await connectToDatabase();
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead },
    { new: true },
  ).lean();
  return notification;
}

export async function getChatHistory(userId: string, sessionId: string): Promise<ChatHistoryItem[]> {
  await connectToDatabase();
  const history = (await ChatHistoryModel.findOne({ userId, sessionId }).lean()) as any;
  return (history?.messages ?? [])
    .filter((message: any) => message.role === "user" || message.role === "assistant")
    .map((message: any) => ({
      role: message.role,
      content: message.content,
      timestamp: message.timestamp?.toISOString?.() ?? new Date().toISOString(),
    }));
}

export async function sendTutorMessage(
  userId: string,
  sessionId: string,
  message: string,
  context?: string,
) {
  await connectToDatabase();
  const history = (await ChatHistoryModel.findOneAndUpdate(
    { userId, sessionId },
    {
      $setOnInsert: { userId, sessionId, messages: [], context: context ?? "" },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean()) as any;

  const conversation = [...(history?.messages ?? []), { role: "user" as const, content: message, timestamp: new Date() }];
  const response = await askNvidiaNim([
    {
      role: "system",
      content:
        context ??
        "You are EduSphere AI, a supportive student tutor. Explain clearly, step by step, and keep the tone encouraging.",
    },
    ...conversation.map((entry) => ({ role: entry.role, content: entry.content })),
  ]);

  await ChatHistoryModel.findOneAndUpdate(
    { userId, sessionId },
    {
      $set: { context: context ?? history?.context ?? "" },
      $push: {
        messages: [
          { role: "user", content: message, timestamp: new Date() },
          { role: "assistant", content: response, timestamp: new Date() },
        ],
      },
    },
    { new: true, upsert: true },
  );

  return response;
}

export async function saveTutorMessage(userId: string, sessionId: string, role: "user" | "assistant", content: string) {
  await connectToDatabase();
  await ChatHistoryModel.findOneAndUpdate(
    { userId, sessionId },
    {
      $setOnInsert: { userId, sessionId, messages: [] },
      $push: { messages: { role, content, timestamp: new Date() } },
    },
    { new: true, upsert: true },
  );
}
