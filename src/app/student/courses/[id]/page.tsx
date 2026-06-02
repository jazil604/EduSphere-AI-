"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ArrowLeft, CheckCircle2, PlayCircle, Trash2 } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";
import type { StudentCourseDetail } from "@/services/student.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function StudentCourseDetailPage({ params }: PageProps) {
  const { id: courseId } = use(params);
  const query = useQuery({
    queryKey: ["student-course", courseId],
    queryFn: () => studentFetchJson<StudentCourseDetail>(`/api/student/courses/${courseId}`),
  });

  const leaveMutation = useMutation({
    mutationFn: () =>
      studentFetchJson(`/api/student/courses/${courseId}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      window.location.href = "/student/courses";
    },
  });

  const data = query.data;
  const nextLesson = data?.lessons.find((lesson) => !lesson.completed) ?? data?.lessons[0];

  return (
    <StudentShell description="Course overview, syllabus, and lesson progress all in one place." title="Course Workspace">
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading course...</div>
      ) : query.isError || !data ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load course.</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <article className="glass-card rounded-3xl p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <Button asChild size="sm" variant="secondary">
                      <Link href="/student/courses">
                        <ArrowLeft aria-hidden className="size-4" />
                        Back
                      </Link>
                    </Button>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-on-surface-variant">{data.course.subject || "General subject"}</span>
                  </div>
                  <h1 className="mt-4 font-heading text-4xl font-bold">{data.course.title}</h1>
                  <p className="mt-3 max-w-3xl text-sm text-on-surface-variant">{data.course.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4">
                    <p className="text-sm text-on-surface-variant">Progress</p>
                    <p className="mt-1 font-heading text-3xl font-bold text-primary">{data.progress}%</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-low">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${data.progress}%` }} />
                    </div>
                  </div>
                  <Button
                    disabled={leaveMutation.isPending}
                    onClick={() => {
                      if (window.confirm(`Leave course "${data.course.title}"?`)) {
                        leaveMutation.mutate();
                      }
                    }}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    <Trash2 aria-hidden className="size-4" />
                    Unenroll
                  </Button>
                </div>
              </div>
            </article>

            <article className="glass-card rounded-3xl p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-2xl font-semibold">Syllabus</h2>
                  <p className="text-sm text-on-surface-variant">Lesson flow, completion status, and quick launch links.</p>
                </div>
                {nextLesson ? (
                  <Button asChild size="sm">
                    <Link href={`/student/courses/${courseId}/lessons/${nextLesson._id}`}>
                      <PlayCircle aria-hidden className="size-4" />
                      Continue lesson
                    </Link>
                  </Button>
                ) : null}
              </div>

              <div className="space-y-3">
                {data.lessons.map((lesson) => (
                  <div className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4" key={lesson._id}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs text-on-surface-variant">#{lesson.order}</span>
                          <h3 className="font-semibold text-primary">{lesson.title}</h3>
                        </div>
                        <p className="mt-2 text-sm text-on-surface-variant line-clamp-2">{lesson.content}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={lesson.completed ? "rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700" : "rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700"}>
                          {lesson.completed ? "Completed" : "Pending"}
                        </span>
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/student/courses/${courseId}/lessons/${lesson._id}`}>
                            <CheckCircle2 aria-hidden className="size-4" />
                            Open
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <aside className="space-y-6">
            <article className="glass-card rounded-3xl p-6">
              <h2 className="font-heading text-2xl font-semibold">Course Details</h2>
              <div className="mt-4 space-y-3 text-sm text-on-surface-variant">
                <p>Teacher: <strong className="text-primary">{data.course.teacherName}</strong></p>
                <p>Enrollment code: <strong className="text-primary">{data.course.enrollmentCode}</strong></p>
                <p>Lessons completed: <strong className="text-primary">{data.lessons.filter((lesson) => lesson.completed).length} / {data.lessons.length}</strong></p>
              </div>
            </article>

            {nextLesson ? (
              <article className="glass-card rounded-3xl p-6">
                <h2 className="font-heading text-2xl font-semibold">Next up</h2>
                <p className="mt-2 text-sm text-on-surface-variant">{nextLesson.title}</p>
                <Button asChild className="mt-4 w-full" size="sm">
                  <Link href={`/student/courses/${courseId}/lessons/${nextLesson._id}`}>
                    <PlayCircle aria-hidden className="size-4" />
                    Resume lesson
                  </Link>
                </Button>
              </article>
            ) : null}
          </aside>
        </div>
      )}
    </StudentShell>
  );
}
