"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Sparkles } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { CourseCard, type StudentCourseCardData } from "@/components/student/CourseCard";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";

type CoursesResponse = {
  availableCourses: StudentCourseCardData[];
  enrolledCourses: StudentCourseCardData[];
};

export default function StudentCoursesPage() {
  const query = useQuery({
    queryKey: ["student-courses"],
    queryFn: () => studentFetchJson<CoursesResponse>("/api/student/courses"),
  });

  return (
    <StudentShell description="Discover courses, jump into the ones you’re enrolled in, and join new learning spaces with an enrollment code." title="Course Management">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button asChild variant="secondary">
          <Link href="/student/courses/join">
            <PlusCircle aria-hidden className="size-4" />
            Join course
          </Link>
        </Button>
      </div>

      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading courses...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load student courses.</div>
      ) : (
        <div className="space-y-8">
          <section className="glass-card rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-semibold">My Enrolled Courses</h2>
                <p className="text-sm text-on-surface-variant">Track progress and continue learning.</p>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-on-surface-variant">{query.data?.enrolledCourses.length ?? 0} enrolled</span>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {query.data?.enrolledCourses.length ? (
                query.data.enrolledCourses.map((course) => <CourseCard course={course} key={course._id} />)
              ) : (
                <div className="rounded-3xl border border-dashed border-outline-variant/60 bg-white/60 p-6 text-sm text-on-surface-variant">
                  You have not joined any courses yet. Use an enrollment code to get started.
                </div>
              )}
            </div>
          </section>

          <section className="glass-card rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-semibold">Browse Available Courses</h2>
                <p className="text-sm text-on-surface-variant">Explore published courses from teachers.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                <Sparkles aria-hidden className="size-3.5" />
                {query.data?.availableCourses.length ?? 0} available
              </span>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {query.data?.availableCourses.map((course) => <CourseCard course={course} key={course._id} />)}
            </div>
          </section>
        </div>
      )}
    </StudentShell>
  );
}
