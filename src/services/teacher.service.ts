import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth/options";
import { connectToDatabase } from "@/lib/db";
import { AnnouncementModel } from "@/lib/db/models/Announcement";
import { AssignmentModel } from "@/lib/db/models/Assignment";
import { AssignmentSubmissionModel } from "@/lib/db/models/AssignmentSubmission";
import { AttendanceModel } from "@/lib/db/models/Attendance";
import { CourseModel } from "@/lib/db/models/Course";
import { LessonModel } from "@/lib/db/models/Lesson";
import { ProgressReportModel } from "@/lib/db/models/ProgressReport";
import { QuestionModel } from "@/lib/db/models/Question";
import { QuizModel } from "@/lib/db/models/Quiz";
import { StudentModel } from "@/lib/db/models/Student";
import { SubmissionModel } from "@/lib/db/models/Submission";
import { TeacherModel } from "@/lib/db/models/Teacher";
import { UserModel } from "@/lib/db/models/User";
import type { UserRole } from "@/types";

type ObjectIdLike = string | { toString(): string };

export type TeacherProfileResponse = {
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
    department: string;
    bio: string;
    isApproved: boolean;
    qualifications: string[];
  } | null;
};

export type TeacherDashboardStatsResponse = {
  stats: {
    myCourses: number;
    totalStudentsEnrolled: number;
    pendingAssignmentsToGrade: number;
    averageClassPerformance: number;
  };
  recentStudentActivity: Array<{
    id: string;
    studentName: string;
    studentEmail: string;
    title: string;
    score: number;
    date: string;
  }>;
  totalSubmissions: number;
};

export type TeacherAnalyticsResponse = {
  stats: TeacherDashboardStatsResponse["stats"];
  courseCompletionRates: Array<{ label: string; value: number }>;
  quizPerformanceTrends: Array<{ label: string; value: number }>;
  studentProgressOverTime: Array<{ label: string; value: number }>;
};

export type TeacherCourseListItem = {
  _id: string;
  title: string;
  description: string;
  subject: string;
  thumbnail: string;
  enrollmentCode: string;
  isPublished: boolean;
  lessonCount: number;
  enrollmentCount: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
};

export type TeacherAssignmentItem = {
  _id: string;
  teacherId: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  attachments: string[];
  maxScore: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TeacherAssignmentSubmissionItem = {
  _id: string;
  assignmentId: string;
  student: {
    id: string;
    name: string;
    email: string;
  } | null;
  submittedAt: string;
  score: number | null;
  feedback: string;
  attachments: string[];
  content: string;
  gradedAt: string | null;
};

function toId(value: ObjectIdLike) {
  return typeof value === "string" ? value : value.toString();
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return startOfDay(date);
}

function asDate(value: unknown) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(String(value));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function requireTeacher() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session?.user || !userId) {
    throw new Error("Unauthorized");
  }

  if (session.user.role === "teacher") {
    return session;
  }

  await connectToDatabase();
  const user = (await UserModel.findById(userId).select("role").lean()) as { role?: UserRole } | null;
  if (user?.role !== "teacher") {
    throw new Error("Unauthorized");
  }

  session.user.role = user.role;

  return session;
}

export async function getTeacherProfile(userId: string) {
  await connectToDatabase();

  const [user, profile] = (await Promise.all([
    UserModel.findById(userId).lean(),
    TeacherModel.findOne({ userId }).lean(),
  ])) as [any, any];

  return {
    user: user
      ? {
          id: toId(user._id),
          name: user.name,
          email: user.email,
          avatar: user.avatar ?? "",
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
        }
      : null,
    profile: profile
      ? {
          department: profile.department ?? "",
          bio: profile.bio ?? "",
          isApproved: profile.isApproved,
          qualifications: profile.qualifications ?? [],
        }
      : null,
  };
}

export async function updateTeacherProfile(
  userId: string,
  input: {
    name?: string;
    email?: string;
    avatar?: string;
    department?: string;
    bio?: string;
    qualifications?: string[];
  },
) {
  await connectToDatabase();

  const userUpdate: Record<string, unknown> = {};
  const profileUpdate: Record<string, unknown> = {};

  if (typeof input.name === "string") userUpdate.name = input.name;
  if (typeof input.email === "string") userUpdate.email = input.email.toLowerCase();
  if (typeof input.avatar === "string") userUpdate.avatar = input.avatar;
  if (typeof input.department === "string") profileUpdate.department = input.department;
  if (typeof input.bio === "string") profileUpdate.bio = input.bio;
  if (Array.isArray(input.qualifications)) profileUpdate.qualifications = input.qualifications;

  await Promise.all([
    Object.keys(userUpdate).length ? UserModel.findByIdAndUpdate(userId, userUpdate, { new: true }) : null,
    TeacherModel.findOneAndUpdate({ userId }, profileUpdate, { new: true, upsert: true, setDefaultsOnInsert: true }),
  ]);

  return getTeacherProfile(userId);
}

export async function changeTeacherPassword(userId: string, currentPassword: string, newPassword: string) {
  await connectToDatabase();

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    throw new Error("Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
}

export async function getTeacherDashboardStats(userId: string) {
  await connectToDatabase();

  const courses = (await CourseModel.find({ teacherId: userId }).lean()) as any[];
  const courseIds = courses.map((course) => course._id);
  const lessons = (await LessonModel.find({ courseId: { $in: courseIds } }).select("_id").lean()) as any[];
  const lessonIds = lessons.map((lesson) => lesson._id);
  const quizzes = (await QuizModel.find({ lessonId: { $in: lessonIds } }).select("_id").lean()) as any[];
  const quizIds = quizzes.map((quiz) => quiz._id);
  const assignmentIds = ((await AssignmentModel.find({ teacherId: userId })
    .select("_id")
    .lean()
    .then((rows) => rows.map((row: any) => row._id))) as unknown[]) as any[];

  const [studentsEnrolled, pendingAssignments, averagePerformance, recentActivity, totalSubmissions] = await Promise.all([
    StudentModel.countDocuments({ enrolledCourses: { $in: courseIds } }),
    AssignmentSubmissionModel.countDocuments({ score: null, assignmentId: { $in: assignmentIds } }),
    SubmissionModel.aggregate<{ averageScore?: number }>([
      { $match: { quizId: { $in: quizIds } } },
      { $group: { _id: null, averageScore: { $avg: "$percentage" } } },
    ]),
    SubmissionModel.find({ quizId: { $in: quizIds } })
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate("studentId", "name email")
      .populate("quizId", "title")
      .lean() as Promise<any[]>,
    SubmissionModel.countDocuments({ quizId: { $in: quizIds } }),
  ]);

  return {
    myCourses: courses.length,
    totalStudentsEnrolled: studentsEnrolled,
    pendingAssignmentsToGrade: pendingAssignments,
    averageClassPerformance: Math.round(averagePerformance[0]?.averageScore ?? 0),
    recentStudentActivity: (recentActivity as any[]).map((entry) => ({
      id: toId(entry._id),
      studentName: (entry.studentId as { name?: string } | undefined)?.name ?? "Student",
      studentEmail: (entry.studentId as { email?: string } | undefined)?.email ?? "",
      title: (entry.quizId as { title?: string } | undefined)?.title ?? "Quiz submission",
      score: entry.percentage,
      date: entry.submittedAt ? entry.submittedAt.toISOString() : new Date().toISOString(),
    })),
    totalSubmissions,
  };
}

export async function getTeacherCourses(userId: string) {
  await connectToDatabase();

  const courses = (await CourseModel.find({ teacherId: userId }).sort({ createdAt: -1 }).lean()) as any[];
  const courseIds = courses.map((course) => course._id);
  const lessonCounts = (await LessonModel.aggregate<{ _id: string; value: number }>([
    { $match: { courseId: { $in: courseIds } } },
    { $group: { _id: { $toString: "$courseId" }, value: { $sum: 1 } } },
  ])) as Array<{ _id: string; value: number }>;
  const lessonMap = new Map(lessonCounts.map((item) => [item._id, item.value]));

  return Promise.all(
    courses.map(async (course) => {
      const completionRate = await getCourseCompletionRate(toId(course._id));
      const enrollmentCount = await StudentModel.countDocuments({ enrolledCourses: course._id });
      return {
        _id: toId(course._id),
        title: course.title,
        description: course.description,
        subject: course.subject ?? "",
        thumbnail: course.thumbnail ?? "",
        enrollmentCode: course.enrollmentCode,
        isPublished: course.isPublished,
        lessonCount: lessonMap.get(toId(course._id)) ?? 0,
        enrollmentCount,
        completionRate,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      };
    }),
  );
}

export async function createCourse(userId: string, input: { title: string; description: string; subject?: string; thumbnail?: string }) {
  await connectToDatabase();
  const enrollmentCode = `${input.title.replace(/[^A-Z0-9]/gi, "").slice(0, 6).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;
  const course = await CourseModel.create({
    teacherId: userId,
    title: input.title.trim(),
    description: input.description.trim(),
    subject: input.subject?.trim() ?? "",
    thumbnail: input.thumbnail?.trim() ?? "",
    lessons: [],
    enrollmentCode,
    isPublished: true,
  });
  return course;
}

export async function updateCourse(userId: string, courseId: string, input: Partial<{ title: string; description: string; subject: string; thumbnail: string; isPublished: boolean }>) {
  await connectToDatabase();
  return CourseModel.findOneAndUpdate(
    { _id: courseId, teacherId: userId },
    {
      ...(typeof input.title === "string" ? { title: input.title.trim() } : {}),
      ...(typeof input.description === "string" ? { description: input.description.trim() } : {}),
      ...(typeof input.subject === "string" ? { subject: input.subject.trim() } : {}),
      ...(typeof input.thumbnail === "string" ? { thumbnail: input.thumbnail.trim() } : {}),
      ...(typeof input.isPublished === "boolean" ? { isPublished: input.isPublished } : {}),
    },
    { new: true },
  ).lean();
}

export async function deleteCourse(userId: string, courseId: string) {
  await connectToDatabase();
  const course = (await CourseModel.findOne({ _id: courseId, teacherId: userId }).lean()) as any;
  if (!course) return null;

  const lessons = (await LessonModel.find({ courseId }).select("_id").lean()) as any[];
  const lessonIds = lessons.map((lesson) => lesson._id);
  const quizzes = (await QuizModel.find({ lessonId: { $in: lessonIds } }).select("_id").lean()) as any[];
  const quizIds = quizzes.map((quiz) => quiz._id);
  const assignmentIds = ((await AssignmentModel.find({ courseId }).select("_id").lean().then((rows) => rows.map((row: any) => row._id))) as unknown[]) as any[];

  await Promise.all([
    QuestionModel.deleteMany({ quizId: { $in: quizIds } }),
    SubmissionModel.deleteMany({ quizId: { $in: quizIds } }),
    AssignmentSubmissionModel.deleteMany({ assignmentId: { $in: assignmentIds } }),
    AssignmentModel.deleteMany({ courseId }),
    ProgressReportModel.deleteMany({ courseId }),
    QuizModel.deleteMany({ lessonId: { $in: lessonIds } }),
    LessonModel.deleteMany({ courseId }),
    AttendanceModel.deleteMany({ courseId }),
    AnnouncementModel.deleteMany({ courseId }),
    CourseModel.findByIdAndDelete(courseId),
  ]);

  return course;
}

export async function getCourseLessons(userId: string, courseId: string) {
  await connectToDatabase();
  const course = (await CourseModel.findOne({ _id: courseId, teacherId: userId }).lean()) as any;
  if (!course) {
    throw new Error("Course not found");
  }
  const lessons = (await LessonModel.find({ courseId }).sort({ order: 1 }).lean()) as any[];
  return lessons.map((lesson) => ({
    _id: toId(lesson._id),
    courseId: toId(lesson.courseId),
    title: lesson.title,
    content: lesson.content,
    videoUrl: lesson.videoUrl ?? "",
    notes: lesson.notes ?? [],
    order: lesson.order,
    duration: lesson.duration ?? 0,
    createdAt: lesson.createdAt.toISOString(),
    updatedAt: lesson.updatedAt.toISOString(),
  }));
}

export async function createLesson(
  userId: string,
  courseId: string,
  input: { title: string; content: string; videoUrl?: string; notes?: string[]; duration?: number; order?: number },
) {
  await connectToDatabase();
  const course = (await CourseModel.findOne({ _id: courseId, teacherId: userId }).lean()) as any;
  if (!course) {
    throw new Error("Course not found");
  }
  const nextOrder =
    input.order ??
    ((await LessonModel.countDocuments({ courseId })) + 1);

  return LessonModel.create({
    courseId,
    title: input.title.trim(),
    content: input.content.trim(),
    videoUrl: input.videoUrl?.trim() ?? "",
    notes: input.notes ?? [],
    duration: input.duration ?? 0,
    order: nextOrder,
  });
}

export async function updateLesson(
  userId: string,
  lessonId: string,
  input: Partial<{ title: string; content: string; videoUrl: string; notes: string[]; duration: number; order: number }>,
) {
  await connectToDatabase();
  const lesson = (await LessonModel.findById(lessonId).lean()) as any;
  if (!lesson) throw new Error("Lesson not found");
  const course = (await CourseModel.findOne({ _id: lesson.courseId, teacherId: userId }).lean()) as any;
  if (!course) throw new Error("Unauthorized");

  return LessonModel.findByIdAndUpdate(
    lessonId,
    {
      ...(typeof input.title === "string" ? { title: input.title.trim() } : {}),
      ...(typeof input.content === "string" ? { content: input.content.trim() } : {}),
      ...(typeof input.videoUrl === "string" ? { videoUrl: input.videoUrl.trim() } : {}),
      ...(Array.isArray(input.notes) ? { notes: input.notes } : {}),
      ...(typeof input.duration === "number" ? { duration: input.duration } : {}),
      ...(typeof input.order === "number" ? { order: input.order } : {}),
    },
    { new: true },
  ).lean();
}

export async function deleteLesson(userId: string, lessonId: string) {
  await connectToDatabase();
  const lesson = (await LessonModel.findById(lessonId).lean()) as any;
  if (!lesson) return null;
  const course = (await CourseModel.findOne({ _id: lesson.courseId, teacherId: userId }).lean()) as any;
  if (!course) throw new Error("Unauthorized");

  const quizzes = (await QuizModel.find({ lessonId }).select("_id").lean()) as any[];
  const quizIds = quizzes.map((quiz) => quiz._id);
  await Promise.all([
    QuestionModel.deleteMany({ quizId: { $in: quizIds } }),
    SubmissionModel.deleteMany({ quizId: { $in: quizIds } }),
    QuizModel.deleteMany({ lessonId }),
    LessonModel.findByIdAndDelete(lessonId),
  ]);

  return lesson;
}

export async function reorderLessons(userId: string, courseId: string, orderedLessonIds: string[]) {
  await connectToDatabase();
  const course = await CourseModel.findOne({ _id: courseId, teacherId: userId }).lean();
  if (!course) throw new Error("Course not found");

  await Promise.all(
    orderedLessonIds.map((lessonId, index) => LessonModel.findByIdAndUpdate(lessonId, { order: index + 1 }, { new: true })),
  );
}

export async function getAssignments(userId: string) {
  await connectToDatabase();
  const assignments = (await AssignmentModel.find({ teacherId: userId }).sort({ createdAt: -1 }).lean()) as any[];
  return assignments.map((assignment) => ({
    _id: toId(assignment._id),
    teacherId: toId(assignment.teacherId),
    courseId: toId(assignment.courseId),
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate.toISOString(),
    attachments: assignment.attachments ?? [],
    maxScore: assignment.maxScore,
    isPublished: assignment.isPublished,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
  }));
}

export async function getAssignmentSubmissions(userId: string, assignmentId: string) {
  await connectToDatabase();
  const assignment = (await AssignmentModel.findOne({ _id: assignmentId, teacherId: userId }).lean()) as any;
  if (!assignment) throw new Error("Assignment not found");

  const submissions = (await AssignmentSubmissionModel.find({ assignmentId })
    .sort({ submittedAt: -1 })
    .populate("studentId", "name email")
    .lean()) as any[];

  return submissions.map((submission) => ({
    _id: toId(submission._id),
    assignmentId: toId(submission.assignmentId),
    student: submission.studentId
      ? {
          id: toId((submission.studentId as { _id: ObjectIdLike })._id),
          name: (submission.studentId as { name?: string }).name ?? "Student",
          email: (submission.studentId as { email?: string }).email ?? "",
        }
      : null,
    submittedAt: submission.submittedAt ? submission.submittedAt.toISOString() : new Date().toISOString(),
    score: submission.score ?? null,
    feedback: submission.feedback ?? "",
    attachments: submission.attachments ?? [],
    content: submission.content ?? "",
    gradedAt: submission.gradedAt ? submission.gradedAt.toISOString() : null,
  }));
}

export async function createAssignment(
  userId: string,
  input: { courseId: string; title: string; description: string; dueDate: string; attachments?: string[]; maxScore?: number; isPublished?: boolean },
) {
  await connectToDatabase();
  const course = await CourseModel.findOne({ _id: input.courseId, teacherId: userId }).lean();
  if (!course) throw new Error("Course not found");
  return AssignmentModel.create({
    teacherId: userId,
    courseId: input.courseId,
    title: input.title.trim(),
    description: input.description.trim(),
    dueDate: new Date(input.dueDate),
    attachments: input.attachments ?? [],
    maxScore: input.maxScore ?? 100,
    isPublished: input.isPublished ?? false,
  });
}

export async function updateAssignment(
  userId: string,
  assignmentId: string,
  input: Partial<{ title: string; description: string; dueDate: string; attachments: string[]; maxScore: number; isPublished: boolean }>,
) {
  await connectToDatabase();
  const assignment = await AssignmentModel.findOne({ _id: assignmentId, teacherId: userId }).lean();
  if (!assignment) throw new Error("Assignment not found");
  return AssignmentModel.findByIdAndUpdate(
    assignmentId,
    {
      ...(typeof input.title === "string" ? { title: input.title.trim() } : {}),
      ...(typeof input.description === "string" ? { description: input.description.trim() } : {}),
      ...(typeof input.dueDate === "string" ? { dueDate: new Date(input.dueDate) } : {}),
      ...(Array.isArray(input.attachments) ? { attachments: input.attachments } : {}),
      ...(typeof input.maxScore === "number" ? { maxScore: input.maxScore } : {}),
      ...(typeof input.isPublished === "boolean" ? { isPublished: input.isPublished } : {}),
    },
    { new: true },
  ).lean();
}

export async function deleteAssignment(userId: string, assignmentId: string) {
  await connectToDatabase();
  const assignment = (await AssignmentModel.findOne({ _id: assignmentId, teacherId: userId }).lean()) as any;
  if (!assignment) return null;
  await AssignmentSubmissionModel.deleteMany({ assignmentId });
  return AssignmentModel.findByIdAndDelete(assignmentId);
}

export async function gradeAssignmentSubmission(
  userId: string,
  submissionId: string,
  input: { score: number; feedback?: string },
) {
  await connectToDatabase();
  const submission = (await AssignmentSubmissionModel.findById(submissionId).lean()) as any;
  if (!submission) throw new Error("Submission not found");
  const assignment = (await AssignmentModel.findById(submission.assignmentId).lean()) as any;
  if (!assignment || toId(assignment.teacherId) !== userId) throw new Error("Unauthorized");
  return AssignmentSubmissionModel.findByIdAndUpdate(
    submissionId,
    {
      score: input.score,
      feedback: input.feedback ?? "",
      gradedBy: userId,
      gradedAt: new Date(),
    },
    { new: true },
  ).lean();
}

export async function getQuizResults(userId: string, quizId: string) {
  await connectToDatabase();
  const quiz = (await QuizModel.findById(quizId).lean()) as any;
  if (!quiz) throw new Error("Quiz not found");
  const lesson = (await LessonModel.findById(quiz.lessonId).lean()) as any;
  if (!lesson) throw new Error("Lesson not found");
  const course = (await CourseModel.findOne({ _id: lesson.courseId, teacherId: userId }).lean()) as any;
  if (!course) throw new Error("Unauthorized");
  const submissions = (await SubmissionModel.find({ quizId }).populate("studentId", "name email").lean()) as any[];
  return submissions.map((submission) => ({
    _id: toId(submission._id),
    student: submission.studentId ? {
      id: toId((submission.studentId as { _id: ObjectIdLike })._id),
      name: (submission.studentId as { name?: string }).name ?? "",
      email: (submission.studentId as { email?: string }).email ?? "",
    } : null,
    score: submission.score,
    percentage: submission.percentage,
    submittedAt: submission.submittedAt.toISOString(),
  }));
}

export async function getTeacherQuizzes(userId: string) {
  await connectToDatabase();
  const courses = (await CourseModel.find({ teacherId: userId }).select("_id").lean()) as any[];
  const courseIds = courses.map((course) => course._id);
  const lessons = (await LessonModel.find({ courseId: { $in: courseIds } }).select("_id").lean()) as any[];
  const lessonIds = lessons.map((lesson) => lesson._id);
  const quizzes = (await QuizModel.find({ lessonId: { $in: lessonIds } }).sort({ createdAt: -1 }).lean()) as any[];
  return quizzes.map((quiz) => ({
    _id: toId(quiz._id),
    lessonId: toId(quiz.lessonId),
    title: quiz.title,
    description: quiz.description ?? "",
    difficulty: quiz.difficulty ?? "medium",
    timeLimit: quiz.timeLimit ?? 0,
    questions: (quiz.questions as any[]).map((question) => toId(question)),
    passingScore: quiz.passingScore,
    createdAt: quiz.createdAt.toISOString(),
    updatedAt: quiz.updatedAt.toISOString(),
  }));
}

export async function createQuiz(
  userId: string,
  input: {
    lessonId: string;
    title: string;
    description?: string;
    difficulty?: "easy" | "medium" | "hard";
    timeLimit?: number;
    passingScore?: number;
    questions: Array<{
      text: string;
      type: "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
      options?: string[];
      correctAnswer: string;
      points?: number;
      explanation?: string;
    }>;
  },
) {
  await connectToDatabase();
  const lesson = (await LessonModel.findById(input.lessonId).lean()) as any;
  if (!lesson) throw new Error("Lesson not found");
  const course = (await CourseModel.findOne({ _id: lesson.courseId, teacherId: userId }).lean()) as any;
  if (!course) throw new Error("Unauthorized");

  const quiz = await QuizModel.create({
    lessonId: input.lessonId,
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    difficulty: input.difficulty ?? "medium",
    timeLimit: input.timeLimit ?? 0,
    questions: [],
    passingScore: input.passingScore ?? 70,
  });

  const questions = await QuestionModel.insertMany(
    input.questions.map((question: {
      text: string;
      type: "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
      options?: string[];
      correctAnswer: string;
      points?: number;
      explanation?: string;
    }) => ({
      quizId: quiz._id,
      text: question.text.trim(),
      type: question.type,
      options: question.options ?? [],
      correctAnswer: question.correctAnswer.trim(),
      points: question.points ?? 1,
      explanation: question.explanation ?? "",
    })),
  );

  quiz.questions = questions.map((question) => question._id);
  await quiz.save();
  return quiz;
}

export async function updateQuiz(
  userId: string,
  quizId: string,
  input: Partial<{
    title: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
    timeLimit: number;
    passingScore: number;
    questions: Array<{
      text: string;
      type: "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
      options?: string[];
      correctAnswer: string;
      points?: number;
      explanation?: string;
    }>;
  }>,
) {
  await connectToDatabase();
  const quiz = (await QuizModel.findById(quizId).lean()) as any;
  if (!quiz) throw new Error("Quiz not found");
  const lesson = (await LessonModel.findById(quiz.lessonId).lean()) as any;
  if (!lesson) throw new Error("Lesson not found");
  const course = (await CourseModel.findOne({ _id: lesson.courseId, teacherId: userId }).lean()) as any;
  if (!course) throw new Error("Unauthorized");

  if (Array.isArray(input.questions)) {
    await QuestionModel.deleteMany({ quizId });
    const questions = await QuestionModel.insertMany(
      input.questions.map((question: {
        text: string;
        type: "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
        options?: string[];
        correctAnswer: string;
        points?: number;
        explanation?: string;
      }) => ({
        quizId,
        text: question.text.trim(),
        type: question.type,
        options: question.options ?? [],
        correctAnswer: question.correctAnswer.trim(),
        points: question.points ?? 1,
        explanation: question.explanation ?? "",
      })),
    );
    const updated = await QuizModel.findByIdAndUpdate(
      quizId,
      {
        ...(typeof input.title === "string" ? { title: input.title.trim() } : {}),
        ...(typeof input.description === "string" ? { description: input.description.trim() } : {}),
        ...(typeof input.difficulty === "string" ? { difficulty: input.difficulty } : {}),
        ...(typeof input.timeLimit === "number" ? { timeLimit: input.timeLimit } : {}),
        ...(typeof input.passingScore === "number" ? { passingScore: input.passingScore } : {}),
        questions: questions.map((question) => question._id),
      },
      { new: true },
    ).lean();
    return updated;
  }

  return QuizModel.findByIdAndUpdate(
    quizId,
    {
      ...(typeof input.title === "string" ? { title: input.title.trim() } : {}),
      ...(typeof input.description === "string" ? { description: input.description.trim() } : {}),
      ...(typeof input.difficulty === "string" ? { difficulty: input.difficulty } : {}),
      ...(typeof input.timeLimit === "number" ? { timeLimit: input.timeLimit } : {}),
      ...(typeof input.passingScore === "number" ? { passingScore: input.passingScore } : {}),
    },
    { new: true },
  ).lean();
}

export async function deleteQuiz(userId: string, quizId: string) {
  await connectToDatabase();
  const quiz = (await QuizModel.findById(quizId).lean()) as any;
  if (!quiz) return null;
  const lesson = (await LessonModel.findById(quiz.lessonId).lean()) as any;
  if (!lesson) throw new Error("Lesson not found");
  const course = (await CourseModel.findOne({ _id: lesson.courseId, teacherId: userId }).lean()) as any;
  if (!course) throw new Error("Unauthorized");

  await Promise.all([
    QuestionModel.deleteMany({ quizId }),
    SubmissionModel.deleteMany({ quizId }),
    QuizModel.findByIdAndDelete(quizId),
  ]);
  return quiz;
}

export async function getTeacherAttendance(userId: string) {
  await connectToDatabase();
  const courses = (await CourseModel.find({ teacherId: userId }).select("_id title").lean()) as any[];
  const courseIds = courses.map((course) => course._id);
  const records = (await AttendanceModel.find({ courseId: { $in: courseIds } })
    .sort({ date: -1 })
    .populate("studentId", "name email")
    .populate("courseId", "title")
    .lean()) as any[];

  return records.map((record) => ({
    _id: toId(record._id),
    student: record.studentId ? { name: (record.studentId as { name?: string }).name ?? "", email: (record.studentId as { email?: string }).email ?? "" } : null,
    course: record.courseId ? { title: (record.courseId as { title?: string }).title ?? "" } : null,
    date: record.date.toISOString(),
    status: record.status,
    markedBy: toId(record.markedBy),
  }));
}

export async function upsertAttendance(
  userId: string,
  input: Array<{ studentId: string; courseId: string; date: string; status: "PRESENT" | "ABSENT" | "LATE" }>,
) {
  await connectToDatabase();
  const allowedCourseIds = new Set(((await CourseModel.find({ teacherId: userId }).select("_id").lean()) as any[]).map((course) => toId(course._id)));

  for (const record of input) {
    if (!allowedCourseIds.has(record.courseId)) {
      throw new Error("Unauthorized");
    }
    await AttendanceModel.findOneAndUpdate(
      { studentId: record.studentId, courseId: record.courseId, date: startOfDay(new Date(record.date)) },
      { status: record.status, markedBy: userId },
      { upsert: true, new: true },
    );
  }
}

export async function getTeacherStudents(userId: string) {
  await connectToDatabase();
  const courses = (await CourseModel.find({ teacherId: userId }).lean()) as any[];
  const courseIds = courses.map((course) => course._id);
  const lessons = (await LessonModel.find({ courseId: { $in: courseIds } }).select("_id").lean()) as any[];
  const lessonIds = lessons.map((lesson) => lesson._id);
  const quizzes = (await QuizModel.find({ lessonId: { $in: lessonIds } }).select("_id").lean()) as any[];
  const quizIds = quizzes.map((quiz) => quiz._id);
  const assignmentIds = await AssignmentModel.find({ teacherId: userId }).select("_id").lean().then((rows) => rows.map((row) => row._id));
  const students = (await StudentModel.find({ enrolledCourses: { $in: courseIds } })
    .populate("userId", "name email avatar")
    .lean()) as any[];

  const submissions = (await SubmissionModel.find({ quizId: { $in: quizIds } }).populate("studentId", "name email").lean()) as any[];
  const assignmentSubmissions = (await AssignmentSubmissionModel.find({ assignmentId: { $in: assignmentIds } })
    .populate("studentId", "name email")
    .lean()) as any[];
  const progressReports = (await ProgressReportModel.find({ courseId: { $in: courseIds } }).lean()) as any[];

  return students.map((student) => {
    const user = student.userId as { _id: ObjectIdLike; name?: string; email?: string; avatar?: string } | undefined;
    const studentId = toId(user?._id ?? student.userId);
    const courseCount = student.enrolledCourses.length;
    const quizResults = submissions.filter((submission) => toId(submission.studentId) === studentId).map((submission) => submission.percentage);
    const assignmentResults = assignmentSubmissions.filter((submission) => toId(submission.studentId) === studentId).map((submission) => submission.score ?? 0);
    const progress = progressReports.filter((report) => toId(report.studentId) === studentId);

    return {
      _id: studentId,
      name: user?.name ?? "Student",
      email: user?.email ?? "",
      avatar: user?.avatar ?? "",
      enrolledCourses: courseCount,
      skillLevel: student.skillLevel ?? "beginner",
      totalPoints: student.totalPoints,
      streak: student.streak,
      quizAverage: quizResults.length ? Math.round(quizResults.reduce((sum, value) => sum + value, 0) / quizResults.length) : 0,
      assignmentAverage: assignmentResults.length ? Math.round(assignmentResults.reduce((sum, value) => sum + value, 0) / assignmentResults.length) : 0,
      recentProgress: progress.length,
    };
  });
}

export async function sendStudentMessage(userId: string, studentId: string, message: string) {
  await connectToDatabase();
  return AnnouncementModel.create({
    title: `Message for ${studentId}`,
    content: message.trim(),
    targetRoles: ["student"],
    courseId: null,
    createdBy: userId,
    isActive: true,
    expiresAt: null,
  });
}

export async function getTeacherAnnouncements(userId: string) {
  await connectToDatabase();
  const courses = (await CourseModel.find({ teacherId: userId }).select("_id title").lean()) as any[];
  const courseIds = courses.map((course) => course._id);
  const announcements = (await AnnouncementModel.find({ $or: [{ createdBy: userId }, { courseId: { $in: courseIds } }] }).sort({ createdAt: -1 }).lean()) as any[];

  return announcements.map((announcement) => ({
    _id: toId(announcement._id),
    title: announcement.title,
    content: announcement.content,
    targetRoles: announcement.targetRoles,
    courseId: announcement.courseId ? toId(announcement.courseId) : null,
    isActive: announcement.isActive,
    expiresAt: announcement.expiresAt ? announcement.expiresAt.toISOString() : null,
    createdAt: announcement.createdAt.toISOString(),
    updatedAt: announcement.updatedAt.toISOString(),
  }));
}

export async function createTeacherAnnouncement(
  userId: string,
  input: { title: string; content: string; courseId?: string | null; targetRoles?: UserRole[]; expiresAt?: string | null },
) {
  await connectToDatabase();
  if (input.courseId) {
    const course = (await CourseModel.findOne({ _id: input.courseId, teacherId: userId }).lean()) as any;
    if (!course) throw new Error("Course not found");
  }

  return AnnouncementModel.create({
    title: input.title.trim(),
    content: input.content.trim(),
    targetRoles: input.targetRoles ?? ["student"],
    courseId: input.courseId ?? null,
    createdBy: userId,
    isActive: true,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  });
}

export async function updateTeacherAnnouncement(
  userId: string,
  id: string,
  input: Partial<{ title: string; content: string; courseId: string | null; targetRoles: UserRole[]; expiresAt: string | null; isActive: boolean }>,
) {
  await connectToDatabase();
  const announcement = (await AnnouncementModel.findById(id).lean()) as any;
  if (!announcement) throw new Error("Announcement not found");
  if (toId(announcement.createdBy) !== userId) throw new Error("Unauthorized");

  const update: Record<string, unknown> = {};
  if (typeof input.title === "string") update.title = input.title.trim();
  if (typeof input.content === "string") update.content = input.content.trim();
  if (input.courseId !== undefined) update.courseId = input.courseId;
  if (Array.isArray(input.targetRoles)) update.targetRoles = input.targetRoles;
  if (typeof input.isActive === "boolean") update.isActive = input.isActive;
  if (input.expiresAt === null) update.expiresAt = null;
  if (typeof input.expiresAt === "string") update.expiresAt = new Date(input.expiresAt);

  return AnnouncementModel.findByIdAndUpdate(id, update, { new: true }).lean();
}

export async function deleteTeacherAnnouncement(userId: string, id: string) {
  await connectToDatabase();
  const announcement = (await AnnouncementModel.findById(id).lean()) as any;
  if (!announcement) return null;
  if (toId(announcement.createdBy) !== userId) throw new Error("Unauthorized");
  return AnnouncementModel.findByIdAndDelete(id);
}

export async function getTeacherAnalytics(userId: string) {
  await connectToDatabase();
  const stats = await getTeacherDashboardStats(userId);
  const courses = (await CourseModel.find({ teacherId: userId }).lean()) as any[];
  const courseIds = courses.map((course) => course._id);
  const lessons = (await LessonModel.find({ courseId: { $in: courseIds } }).select("_id").lean()) as any[];
  const lessonIds = lessons.map((lesson) => lesson._id);
  const quizzes = (await QuizModel.find({ lessonId: { $in: lessonIds } }).select("_id").lean()) as any[];
  const quizIds = quizzes.map((quiz) => quiz._id);
  const reports = (await ProgressReportModel.find({ courseId: { $in: courseIds } }).lean()) as any[];

  const completionRates = await Promise.all(
    courses.map(async (course) => ({
      label: course.title,
      value: await getCourseCompletionRate(toId(course._id)),
    })),
  );

  const quizTrend = await SubmissionModel.aggregate<{ _id: string; value: number }>([
    { $match: { quizId: { $in: quizIds } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
        value: { $avg: "$percentage" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const progressBuckets = new Map<string, number[]>();
  for (const report of reports) {
    const timestamp = asDate(report.timestamp ?? report.createdAt);
    if (!timestamp) continue;
    const key = timestamp.toISOString().slice(0, 10);
    const values = Object.values(report.skillScores ?? {}).map((value) => Number(value)).filter((value) => Number.isFinite(value));
    progressBuckets.set(key, [...(progressBuckets.get(key) ?? []), average(values)]);
  }

  const progressOverTime = Array.from(progressBuckets.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, values]) => ({ label, value: Math.round(average(values)) }));

  return {
    stats,
    courseCompletionRates: completionRates,
    quizPerformanceTrends: quizTrend.map((item) => ({ label: item._id, value: Math.round(item.value) })),
    studentProgressOverTime: progressOverTime,
  };
}

async function getCourseCompletionRate(courseId: string) {
  const lessons = await LessonModel.find({ courseId }).select("_id").lean();
  const lessonIds = lessons.map((lesson) => lesson._id);
  if (lessonIds.length === 0) {
    return 0;
  }
  const quizzes = await QuizModel.find({ lessonId: { $in: lessonIds } }).select("_id").lean();
  const quizIds = quizzes.map((quiz) => quiz._id);
  if (quizIds.length === 0) {
    return 0;
  }
  const aggregate = await SubmissionModel.aggregate<{ averageScore?: number }>([
    { $match: { quizId: { $in: quizIds } } },
    { $group: { _id: null, averageScore: { $avg: "$percentage" } } },
  ]);
  return Math.round(aggregate[0]?.averageScore ?? 0);
}
