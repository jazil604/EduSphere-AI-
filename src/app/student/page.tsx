"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, Clock3, PlayCircle } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { StatsCards } from "@/components/student/StatsCards";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";
import type { StudentDashboardResponse } from "@/services/student.service";

export default function StudentDashboardPage() {
  const query = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: () => studentFetchJson<StudentDashboardResponse>("/api/student"),
  });

  const dashboard = query.data;

  return (
    <StudentShell
      description="Pick up where you left off, stay ahead of deadlines, and keep your learning momentum moving."
      title="Learning Overview"
    >
      <StatsCards />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Recent Activity</h2>
              <p className="text-sm text-on-surface-variant">Your latest quizzes, submissions, and course updates.</p>
            </div>
          </div>

          {query.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="h-20 animate-pulse rounded-3xl bg-slate-200/70" key={index} />
              ))}
            </div>
          ) : query.isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load dashboard activity.</div>
          ) : dashboard?.recentActivity.length ? (
            <div className="space-y-3">
              {dashboard.recentActivity.map((item) => (
                <article className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4" key={item.id}>
                  <p className="font-semibold text-primary">{item.title}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{item.detail}</p>
                  <p className="mt-2 text-xs text-on-surface-variant">{new Date(item.date).toLocaleString()}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-outline-variant/60 bg-white/60 p-6 text-sm text-on-surface-variant">
              No activity yet. Start a quiz or join a course to see your timeline here.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-semibold">Continue Learning</h2>
                <p className="text-sm text-on-surface-variant">Resume courses you’ve already started.</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {(dashboard?.continueLearning ?? []).slice(0, 3).map((course) => (
                <article className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4" key={course._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-primary">{course.title}</h3>
                      <p className="text-sm text-on-surface-variant">{course.subject || "General subject"}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-on-surface-variant">{course.progress}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-low">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${course.progress}%` }} />
                  </div>
                  <Button asChild className="mt-4 w-full" size="sm" variant="secondary">
                    <Link href={`/student/courses/${course._id}`}>
                      <PlayCircle aria-hidden className="size-4" />
                      Resume
                    </Link>
                  </Button>
                </article>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-semibold">Upcoming Deadlines</h2>
                <p className="text-sm text-on-surface-variant">Assignments and quizzes due soon.</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {(dashboard?.upcomingDeadlines ?? []).length ? (
                dashboard?.upcomingDeadlines.map((deadline) => (
                  <article className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4" key={deadline._id}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-primary">{deadline.title}</p>
                        <p className="text-sm text-on-surface-variant">{deadline.courseTitle}</p>
                      </div>
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700 capitalize">{deadline.type}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
                      <CalendarClock aria-hidden className="size-4" />
                      Due {new Date(deadline.dueDate).toLocaleString()}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-outline-variant/60 bg-white/60 p-6 text-sm text-on-surface-variant">
                  No upcoming deadlines right now.
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="ai-gradient flex size-11 items-center justify-center rounded-2xl text-white">
                <Clock3 aria-hidden className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-semibold">Learning Momentum</h2>
                <p className="text-sm text-on-surface-variant">Keep your streak going with short daily sessions.</p>
              </div>
            </div>
            <div className="mt-4 rounded-3xl border border-outline-variant/40 bg-white/70 p-4">
              <p className="text-sm text-on-surface-variant">Your current streak is strong. Come back today to maintain it and unlock more recommendations from the tutor.</p>
              <Button asChild className="mt-4 w-full" size="sm">
                <Link href="/student/ai-tutor">
                  Ask AI Tutor
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </StudentShell>
  );
}
