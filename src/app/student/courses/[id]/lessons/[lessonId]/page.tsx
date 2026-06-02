"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ArrowLeft } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { LessonPlayer } from "@/components/student/LessonPlayer";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";
import type { StudentCourseDetail } from "@/services/student.service";

type PageProps = {
  params: Promise<{ id: string; lessonId: string }>;
};

export default function StudentLessonPage({ params }: PageProps) {
  const { id: courseId, lessonId } = use(params);
  const query = useQuery({
    queryKey: ["student-course", courseId],
    queryFn: () => studentFetchJson<StudentCourseDetail>(`/api/student/courses/${courseId}`),
  });

  const data = query.data;
  const lesson = data?.lessons.find((item) => item._id === lessonId);

  return (
    <StudentShell description="Watch the lesson, study the notes, and mark your progress as you move through the course." title="Lesson Room">
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading lesson...</div>
      ) : query.isError || !data || !lesson ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Lesson not found.</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div>
              <Button asChild size="sm" variant="secondary">
                <Link href={`/student/courses/${courseId}`}>
                  <ArrowLeft aria-hidden className="size-4" />
                  Back to course
                </Link>
              </Button>
            </div>

            <LessonPlayer courseId={courseId} lesson={lesson} />
          </section>

          <aside className="space-y-4">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="font-heading text-2xl font-semibold">Course Lessons</h2>
              <div className="mt-4 space-y-3">
                {data.lessons.map((item) => (
                  <Link
                    className={item._id === lessonId ? "block rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3" : "block rounded-2xl border border-outline-variant/40 bg-white/70 px-4 py-3"}
                    href={`/student/courses/${courseId}/lessons/${item._id}`}
                    key={item._id}
                  >
                    <p className="font-semibold text-primary">{item.title}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{item.completed ? "Completed" : "Pending"}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </StudentShell>
  );
}
