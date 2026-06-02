export type UserRole = "admin" | "teacher" | "student";

export type Course = {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
};

export type ProgressSummary = {
  studentId: string;
  courseId: string;
  completionPercentage: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
};
