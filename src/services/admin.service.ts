import { auth } from "@/lib/auth/options";
import { connectToDatabase } from "@/lib/db";
import { AnnouncementModel } from "@/lib/db/models/Announcement";
import { AuditLogModel } from "@/lib/db/models/AuditLog";
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
import { createUser } from "@/services/auth/signup";

type MongoId = string;

export type AdminUserTab = "all" | "students" | "teachers";
export type AdminUserStatusFilter = "all" | "active" | "blocked";

export type AdminUserListItem = {
  _id: MongoId;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  studentProfile?: {
    skillLevel?: string;
    totalPoints: number;
    streak: number;
    enrolledCourses: number;
  };
  teacherProfile?: {
    department?: string;
    bio?: string;
    isApproved: boolean;
    qualifications: string[];
  };
};

export type AdminUserListResponse = {
  items: AdminUserListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminCourseListItem = {
  _id: MongoId;
  title: string;
  description: string;
  teacherId: MongoId;
  teacherName: string;
  subject?: string;
  thumbnail?: string;
  lessonsCount: number;
  enrollmentCode: string;
  isPublished: boolean;
  enrollmentCount: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalQuizzes: number;
  activeUsersToday: number;
  averagePerformanceScore: number;
};

export type ActivityLogItem = {
  _id: MongoId;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: MongoId;
    name: string;
    email: string;
    role: UserRole;
  } | null;
};

export type AnalyticsResponse = {
  stats: DashboardStats;
  dailyActiveUsers: Array<{ label: string; value: number }>;
  courseEnrollmentTrends: Array<{ label: string; value: number }>;
  quizPerformanceDistribution: Array<{ name: string; value: number }>;
  revenueOverview: Array<{ label: string; value: number }>;
};

export type AnnouncementItem = {
  _id: MongoId;
  title: string;
  content: string;
  targetRoles: UserRole[];
  createdBy?: {
    _id: MongoId;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditLogQuery = {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
};

function toIso(value: unknown) {
  return value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();
}

function normalizeDateOrNull(value: unknown) {
  if (!value) {
    return null;
  }
  return value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();
}

function getStartOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function toObjectIdString(value: unknown) {
  if (!value) return "";
  return typeof value === "string" ? value : String(value);
}

export async function requireAdmin() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session?.user || !userId) {
    throw new Error("Unauthorized");
  }

  if (session.user.role === "admin") {
    return session;
  }

  await connectToDatabase();
  const user = (await UserModel.findById(userId).select("role").lean()) as { role?: UserRole } | null;
  if (user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  session.user.role = user.role;

  return session;
}

export async function recordAuditLog(input: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  await connectToDatabase();
  return AuditLogModel.create({
    userId: input.userId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    metadata: input.metadata ?? {},
    ipAddress: input.ipAddress ?? null,
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectToDatabase();
  const startOfDay = getStartOfToday();

  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    totalQuizzes,
    activeUsersToday,
    performanceAggregate,
  ] = await Promise.all([
    UserModel.countDocuments({ role: "student" }),
    UserModel.countDocuments({ role: "teacher" }),
    CourseModel.countDocuments(),
    QuizModel.countDocuments(),
    UserModel.countDocuments({ lastLogin: { $gte: startOfDay } }),
    SubmissionModel.aggregate<{ averageScore?: number }>([
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$percentage" },
        },
      },
    ]),
  ]);

  return {
    totalStudents,
    totalTeachers,
    totalCourses,
    totalQuizzes,
    activeUsersToday,
    averagePerformanceScore: Math.round(performanceAggregate[0]?.averageScore ?? 0),
  };
}

export async function getRecentActivity(limit = 10): Promise<ActivityLogItem[]> {
  await connectToDatabase();

  const logs = await AuditLogModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "name email role")
    .lean();

  return logs.map((log) => ({
    _id: toObjectIdString(log._id),
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId ?? null,
    metadata: (log.metadata as Record<string, unknown>) ?? {},
    ipAddress: log.ipAddress ?? null,
    createdAt: toIso(log.createdAt),
    updatedAt: toIso(log.updatedAt),
    user: log.userId
      ? {
          _id: toObjectIdString(log.userId._id),
          name: log.userId.name,
          email: log.userId.email,
          role: log.userId.role as UserRole,
        }
      : null,
  }));
}

export async function getAdminUsers({
  page = 1,
  limit = 10,
  search = "",
  tab = "all",
  status = "all",
}: {
  page?: number;
  limit?: number;
  search?: string;
  tab?: AdminUserTab;
  status?: AdminUserStatusFilter;
}): Promise<AdminUserListResponse> {
  await connectToDatabase();

  const query: Record<string, unknown> = {};

  if (tab === "students") {
    query.role = "student";
  } else if (tab === "teachers") {
    query.role = "teacher";
  }

  if (status === "active") {
    query.isActive = true;
  } else if (status === "blocked") {
    query.isActive = false;
  }

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    query.$or = [
      { name: { $regex: trimmedSearch, $options: "i" } },
      { email: { $regex: trimmedSearch, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    UserModel.countDocuments(query),
  ]);

  const userIds = users.map((user) => user._id);
  const [studentProfiles, teacherProfiles] = await Promise.all([
    StudentModel.find({ userId: { $in: userIds } }).lean(),
    TeacherModel.find({ userId: { $in: userIds } }).lean(),
  ]);

  const studentMap = new Map(studentProfiles.map((profile) => [toObjectIdString(profile.userId), profile]));
  const teacherMap = new Map(teacherProfiles.map((profile) => [toObjectIdString(profile.userId), profile]));

  return {
    items: users.map((user) => ({
      _id: toObjectIdString(user._id),
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      avatar: user.avatar ?? "",
      isActive: Boolean(user.isActive),
      isEmailVerified: Boolean(user.isEmailVerified),
      lastLogin: normalizeDateOrNull(user.lastLogin),
      createdAt: toIso(user.createdAt),
      updatedAt: toIso(user.updatedAt),
      studentProfile: studentMap.has(toObjectIdString(user._id))
        ? {
            skillLevel: studentMap.get(toObjectIdString(user._id))?.skillLevel,
            totalPoints: studentMap.get(toObjectIdString(user._id))?.totalPoints ?? 0,
            streak: studentMap.get(toObjectIdString(user._id))?.streak ?? 0,
            enrolledCourses: studentMap.get(toObjectIdString(user._id))?.enrolledCourses?.length ?? 0,
          }
        : undefined,
      teacherProfile: teacherMap.has(toObjectIdString(user._id))
        ? {
            department: teacherMap.get(toObjectIdString(user._id))?.department,
            bio: teacherMap.get(toObjectIdString(user._id))?.bio,
            isApproved: Boolean(teacherMap.get(toObjectIdString(user._id))?.isApproved),
            qualifications: teacherMap.get(toObjectIdString(user._id))?.qualifications ?? [],
          }
        : undefined,
    })),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
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
    {
      $group: {
        _id: null,
        averageScore: { $avg: "$percentage" },
      },
    },
  ]);

  return Math.round(aggregate[0]?.averageScore ?? 0);
}

export async function getAdminCourses(): Promise<AdminCourseListItem[]> {
  await connectToDatabase();

  const courses = await CourseModel.find().sort({ createdAt: -1 }).lean();
  const teacherIds = courses.map((course) => course.teacherId);
  const teacherUsers = await UserModel.find({ _id: { $in: teacherIds } }).select("name").lean();
  const teacherMap = new Map(teacherUsers.map((teacher) => [toObjectIdString(teacher._id), teacher.name]));

  const items = await Promise.all(
    courses.map(async (course) => {
      const [enrollmentCount, lessonsCount, completionRate] = await Promise.all([
        StudentModel.countDocuments({ enrolledCourses: course._id }),
        LessonModel.countDocuments({ courseId: course._id }),
        getCourseCompletionRate(toObjectIdString(course._id)),
      ]);

      return {
        _id: toObjectIdString(course._id),
        title: course.title,
        description: course.description,
        teacherId: toObjectIdString(course.teacherId),
        teacherName: teacherMap.get(toObjectIdString(course.teacherId)) ?? "Unknown",
        subject: course.subject ?? "",
        thumbnail: course.thumbnail ?? "",
        lessonsCount,
        enrollmentCode: course.enrollmentCode,
        isPublished: Boolean(course.isPublished),
        enrollmentCount,
        completionRate,
        createdAt: toIso(course.createdAt),
        updatedAt: toIso(course.updatedAt),
      };
    }),
  );

  return items;
}

export async function deleteCourseCascade(courseId: string) {
  await connectToDatabase();

  const lessons = await LessonModel.find({ courseId }).select("_id").lean();
  const lessonIds = lessons.map((lesson) => lesson._id);
  const quizzes = await QuizModel.find({ lessonId: { $in: lessonIds } }).select("_id").lean();
  const quizIds = quizzes.map((quiz) => quiz._id);

  await Promise.all([
    QuestionModel.deleteMany({ quizId: { $in: quizIds } }),
    SubmissionModel.deleteMany({ quizId: { $in: quizIds } }),
    ProgressReportModel.deleteMany({ courseId }),
    QuizModel.deleteMany({ lessonId: { $in: lessonIds } }),
    LessonModel.deleteMany({ courseId }),
    CourseModel.findByIdAndDelete(courseId),
  ]);
}

export async function deleteUserCascade(userId: string) {
  await connectToDatabase();

  const user = (await UserModel.findById(userId).lean()) as { role?: UserRole } | null;
  if (!user) {
    return;
  }

  if (user.role === "student") {
    await Promise.all([
      StudentModel.deleteOne({ userId }),
      SubmissionModel.deleteMany({ studentId: userId }),
      ProgressReportModel.deleteMany({ studentId: userId }),
      AuditLogModel.deleteMany({ userId }),
    ]);
  }

  if (user.role === "teacher") {
    const courses = await CourseModel.find({ teacherId: userId }).select("_id").lean();
    const courseIds = courses.map((course) => toObjectIdString(course._id));
    for (const courseId of courseIds) {
      await deleteCourseCascade(courseId);
    }

    await TeacherModel.deleteOne({ userId });
  }

  await UserModel.findByIdAndDelete(userId);
}

export async function updateUserByAdmin(
  userId: string,
  input: Partial<{
    name: string;
    email: string;
    avatar: string;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLogin: string | null;
  }>,
) {
  await connectToDatabase();

  const update: Record<string, unknown> = {};
  if (typeof input.name === "string") update.name = input.name;
  if (typeof input.email === "string") update.email = input.email.toLowerCase();
  if (typeof input.avatar === "string") update.avatar = input.avatar;
  if (typeof input.isActive === "boolean") update.isActive = input.isActive;
  if (typeof input.isEmailVerified === "boolean") update.isEmailVerified = input.isEmailVerified;
  if (typeof input.lastLogin === "string") update.lastLogin = new Date(input.lastLogin);
  if (input.lastLogin === null) update.lastLogin = null;

  return UserModel.findByIdAndUpdate(userId, update, { new: true }).lean();
}

export async function approveTeacherProfile(userId: string, approved: boolean) {
  await connectToDatabase();

  await Promise.all([
    TeacherModel.findOneAndUpdate({ userId }, { isApproved: approved }, { new: true }),
    UserModel.findByIdAndUpdate(userId, { isActive: approved ? true : false }, { new: true }),
  ]);
}

export function normalizeAnnouncementRoles(target: string | string[]) {
  const roles = Array.isArray(target) ? target : [target];
  if (roles.includes("all")) {
    return ["admin", "teacher", "student"] as UserRole[];
  }
  return roles.filter((role): role is UserRole => role === "admin" || role === "teacher" || role === "student");
}

export async function getAnnouncements(): Promise<AnnouncementItem[]> {
  await connectToDatabase();

  const announcements = await AnnouncementModel.find().sort({ createdAt: -1 }).populate("createdBy", "name email role").lean();

  return announcements.map((announcement) => ({
    _id: toObjectIdString(announcement._id),
    title: announcement.title,
    content: announcement.content,
    targetRoles: announcement.targetRoles as UserRole[],
    createdBy: announcement.createdBy
      ? {
          _id: toObjectIdString(announcement.createdBy._id),
          name: announcement.createdBy.name,
          email: announcement.createdBy.email,
          role: announcement.createdBy.role as UserRole,
        }
      : null,
    isActive: Boolean(announcement.isActive),
    expiresAt: normalizeDateOrNull(announcement.expiresAt),
    createdAt: toIso(announcement.createdAt),
    updatedAt: toIso(announcement.updatedAt),
  }));
}

export async function createAnnouncement(input: {
  title: string;
  content: string;
  targetRoles: UserRole[];
  expiresAt?: string | null;
  createdBy: string;
}) {
  await connectToDatabase();

  return AnnouncementModel.create({
    title: input.title.trim(),
    content: input.content.trim(),
    targetRoles: input.targetRoles,
    createdBy: input.createdBy,
    isActive: true,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  });
}

export async function updateAnnouncement(
  id: string,
  input: Partial<{
    title: string;
    content: string;
    targetRoles: UserRole[];
    expiresAt: string | null;
    isActive: boolean;
  }>,
) {
  await connectToDatabase();

  const update: Record<string, unknown> = {};
  if (typeof input.title === "string") update.title = input.title.trim();
  if (typeof input.content === "string") update.content = input.content.trim();
  if (Array.isArray(input.targetRoles)) update.targetRoles = input.targetRoles;
  if (typeof input.isActive === "boolean") update.isActive = input.isActive;
  if (input.expiresAt === null) update.expiresAt = null;
  if (typeof input.expiresAt === "string") update.expiresAt = new Date(input.expiresAt);

  return AnnouncementModel.findByIdAndUpdate(id, update, { new: true }).lean();
}

export async function deleteAnnouncement(id: string) {
  await connectToDatabase();
  return AnnouncementModel.findByIdAndDelete(id);
}

export async function getAuditLogs(query: AuditLogQuery) {
  await connectToDatabase();

  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;
  const dbQuery: Record<string, unknown> = {};

  if (query.userId) {
    dbQuery.userId = query.userId;
  }

  if (query.action) {
    dbQuery.action = { $regex: query.action.trim(), $options: "i" };
  }

  if (query.startDate || query.endDate) {
    dbQuery.createdAt = {};
    if (query.startDate) {
      (dbQuery.createdAt as Record<string, Date>).$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      (dbQuery.createdAt as Record<string, Date>).$lte = new Date(query.endDate);
    }
  }

  const [logs, total] = await Promise.all([
    AuditLogModel.find(dbQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email role")
      .lean(),
    AuditLogModel.countDocuments(dbQuery),
  ]);

  return {
    items: logs.map((log) => ({
      _id: toObjectIdString(log._id),
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId ?? null,
      metadata: (log.metadata as Record<string, unknown>) ?? {},
      ipAddress: log.ipAddress ?? null,
      createdAt: toIso(log.createdAt),
      updatedAt: toIso(log.updatedAt),
      user: log.userId
        ? {
            _id: toObjectIdString(log.userId._id),
            name: log.userId.name,
            email: log.userId.email,
            role: log.userId.role as UserRole,
          }
        : null,
    })),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getAuditLogsCsv(query: AuditLogQuery) {
  const result = await getAuditLogs({ ...query, limit: 5000 });
  const header = ["Created At", "User", "Action", "Entity Type", "Entity ID", "IP Address", "Metadata"];
  const lines = result.items.map((item) => [
    item.createdAt,
    item.user?.email ?? "System",
    item.action,
    item.entityType,
    item.entityId ?? "",
    item.ipAddress ?? "",
    JSON.stringify(item.metadata ?? {}),
  ]);

  return [header, ...lines]
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return `"${text.replaceAll('"', '""')}"`;
        })
        .join(","),
    )
    .join("\n");
}

export async function getAnalyticsData(): Promise<AnalyticsResponse> {
  const stats = await getDashboardStats();
  await connectToDatabase();

  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const dailyActiveUsersAggregation = await UserModel.aggregate<{ _id: string; value: number }>([
    {
      $match: {
        lastLogin: {
          $gte: start,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$lastLogin" },
        },
        value: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dailyMap = new Map(dailyActiveUsersAggregation.map((entry) => [entry._id, entry.value]));
  const dailyActiveUsers = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const label = date.toISOString().slice(0, 10);
    return { label, value: dailyMap.get(label) ?? 0 };
  });

  const recentCourses = await CourseModel.find().sort({ createdAt: -1 }).limit(6).lean();
  const courseEnrollmentTrends = await Promise.all(
    recentCourses.map(async (course) => ({
      label: course.title,
      value: await StudentModel.countDocuments({ enrolledCourses: course._id }),
    })),
  );

  const performanceAggregation = await SubmissionModel.aggregate<{ _id: number | string; value: number }>([
    {
      $bucket: {
        groupBy: "$percentage",
        boundaries: [0, 60, 75, 90, 101],
        default: "unknown",
        output: { value: { $sum: 1 } },
      },
    },
  ]);

  const performanceMap = new Map(
    performanceAggregation
      .filter((entry) => typeof entry._id === "number")
      .map((entry) => [entry._id, entry.value]),
  );
  const quizPerformanceDistribution = [
    { name: "Below 60", value: performanceMap.get(0) ?? 0 },
    { name: "60-74", value: performanceMap.get(60) ?? 0 },
    { name: "75-89", value: performanceMap.get(75) ?? 0 },
    { name: "90-100", value: performanceMap.get(90) ?? 0 },
  ];

  const revenueOverview = [
    { label: "Jan", value: 0 },
    { label: "Feb", value: 0 },
    { label: "Mar", value: 0 },
    { label: "Apr", value: 0 },
    { label: "May", value: 0 },
    { label: "Jun", value: 0 },
  ];

  return {
    stats,
    dailyActiveUsers,
    courseEnrollmentTrends,
    quizPerformanceDistribution,
    revenueOverview,
  };
}

export async function createManagedUser(input: {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "admin">;
  educationLevel?: string;
  subjectSpecialization?: string;
}) {
  return createUser(input);
}
