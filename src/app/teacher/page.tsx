"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CalendarCheck2, PlusCircle, Sparkles } from "lucide-react";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { StatsCards } from "@/components/teacher/StatsCards";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";
import type { TeacherDashboardStatsResponse } from "@/services/teacher.service";

export default function TeacherDashboardPage() {
  const query = useQuery({
    queryKey: ["teacher-analytics"],
    queryFn: () => teacherFetchJson<TeacherDashboardStatsResponse>("/api/teacher/analytics"),
  });

  return (
    <TeacherShell
      description="Plan courses, guide learners, and track class performance from one workspace."
      title="Teacher Overview"
    >
      <StatsCards />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Recent Student Activity</h2>
              <p className="text-sm text-on-surface-variant">Latest quiz submissions and learning signals.</p>
            </div>
          </div>

          {query.isLoading ? (
            <div className="text-sm text-on-surface-variant">Loading activity...</div>
          ) : query.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load activity.</div>
          ) : (
            <div className="space-y-3">
              {query.data?.recentStudentActivity?.map((item) => (
                <article className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4" key={item.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-primary">{item.studentName}</p>
                      <p className="text-sm text-on-surface-variant">{item.studentEmail}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      {item.score}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-on-surface-variant">{item.title}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{new Date(item.date).toLocaleString()}</p>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-heading text-2xl font-semibold">Quick Actions</h2>
            <div className="mt-4 grid gap-3">
              <Button asChild className="justify-between" variant="secondary">
                <Link href="/teacher/courses/create">
                  <span className="flex items-center gap-3">
                    <PlusCircle aria-hidden className="size-4" />
                    Create Course
                  </span>
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Button>
              <Button asChild className="justify-between" variant="secondary">
                <Link href="/teacher/quizzes/create">
                  <span className="flex items-center gap-3">
                    <Sparkles aria-hidden className="size-4" />
                    Create Quiz
                  </span>
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Button>
              <Button asChild className="justify-between" variant="secondary">
                <Link href="/teacher/attendance">
                  <span className="flex items-center gap-3">
                    <CalendarCheck2 aria-hidden className="size-4" />
                    Mark Attendance
                  </span>
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Button>
              <Button asChild className="justify-between" variant="secondary">
                <Link href="/teacher/courses">
                  <span className="flex items-center gap-3">
                    <BookOpen aria-hidden className="size-4" />
                    Manage Courses
                  </span>
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </TeacherShell>
  );
}

