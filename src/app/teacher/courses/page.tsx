"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { CourseCard, type TeacherCourseCardData } from "@/components/teacher/CourseCard";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";

export default function TeacherCoursesPage() {
  const query = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: () => teacherFetchJson<TeacherCourseCardData[]>("/api/teacher/courses"),
  });

  return (
    <TeacherShell
      description="Create, edit, and organize your courses. Use the lessons view to add lecture content and reorder materials."
      title="Course Management"
    >
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/teacher/courses/create">
            <PlusCircle aria-hidden className="size-4" />
            Create course
          </Link>
        </Button>
      </div>

      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading courses...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load courses.</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {query.data?.map((course) => (
            <CourseCard course={course} key={course._id} />
          ))}
        </div>
      )}
    </TeacherShell>
  );
}

