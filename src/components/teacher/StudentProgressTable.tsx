"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherFetchJson } from "@/components/teacher/api";

export type TeacherStudentRow = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourses: number;
  skillLevel: string;
  totalPoints: number;
  streak: number;
  quizAverage: number;
  assignmentAverage: number;
  recentProgress: number;
};

export function StudentProgressTable() {
  const query = useQuery({
    queryKey: ["teacher-students"],
    queryFn: () => teacherFetchJson<TeacherStudentRow[]>("/api/teacher/students"),
  });

  if (query.isLoading) return <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading students...</div>;
  if (query.isError) return <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load students.</div>;

  return (
    <div className="glass-card overflow-hidden rounded-3xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-outline-variant/40">
          <thead className="bg-white/50">
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              <th className="px-5 py-4">Student</th>
              <th className="px-5 py-4">Courses</th>
              <th className="px-5 py-4">Quiz Avg</th>
              <th className="px-5 py-4">Assignment Avg</th>
              <th className="px-5 py-4">Streak</th>
              <th className="px-5 py-4">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 bg-white/40">
            {query.data?.map((student) => (
              <tr key={student._id}>
                <td className="px-5 py-4">
                  <p className="font-medium text-primary">{student.name}</p>
                  <p className="text-sm text-on-surface-variant">{student.email}</p>
                </td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">{student.enrolledCourses}</td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">{student.quizAverage}%</td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">{student.assignmentAverage}%</td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">{student.streak} days</td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">{student.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

