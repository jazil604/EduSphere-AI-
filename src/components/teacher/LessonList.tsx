"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Clock3, PencilLine, Trash2 } from "lucide-react";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";

export type TeacherLesson = {
  _id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl: string;
  notes: string[];
  order: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
};

type LessonListProps = {
  courseId: string;
};

export function LessonList({ courseId }: LessonListProps) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["teacher-lessons", courseId],
    queryFn: () => teacherFetchJson<TeacherLesson[]>(`/api/teacher/courses/${courseId}/lessons`),
  });

  const deleteMutation = useMutation({
    mutationFn: (lessonId: string) =>
      teacherFetchJson(`/api/teacher/courses/${courseId}/lessons`, {
        method: "DELETE",
        body: JSON.stringify({ id: lessonId }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teacher-lessons", courseId] });
      await queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["teacher-analytics"] });
    },
  });

  const moveMutation = useMutation({
    mutationFn: (payload: { id: string; order: number }) =>
      teacherFetchJson(`/api/teacher/courses/${courseId}/lessons`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teacher-lessons", courseId] });
    },
  });

  if (query.isLoading) {
    return <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading lessons...</div>;
  }

  if (query.isError) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load lessons.</div>;
  }

  return (
    <div className="space-y-3">
      {query.data?.map((lesson, index) => (
        <article className="glass-card rounded-3xl p-5" key={lesson._id}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-on-surface-variant">#{lesson.order}</span>
                <h3 className="font-heading text-2xl font-semibold">{lesson.title}</h3>
              </div>
              <p className="mt-2 text-sm text-on-surface-variant">{lesson.content}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                <span className="rounded-full bg-white/70 px-3 py-1">
                  <Clock3 aria-hidden className="mr-1 inline size-3" />
                  {lesson.duration} min
                </span>
                {lesson.videoUrl ? <span className="rounded-full bg-white/70 px-3 py-1">Video linked</span> : null}
                {lesson.notes.length ? <span className="rounded-full bg-white/70 px-3 py-1">{lesson.notes.length} note(s)</span> : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                disabled={moveMutation.isPending || index === 0}
                onClick={() => moveMutation.mutate({ id: lesson._id, order: lesson.order - 1 })}
                size="sm"
                variant="secondary"
                type="button"
              >
                <ArrowUp aria-hidden className="size-4" />
              </Button>
              <Button
                disabled={moveMutation.isPending || index === (query.data?.length ?? 0) - 1}
                onClick={() => moveMutation.mutate({ id: lesson._id, order: lesson.order + 1 })}
                size="sm"
                variant="secondary"
                type="button"
              >
                <ArrowDown aria-hidden className="size-4" />
              </Button>
              <Button asChild size="sm" variant="secondary">
                <a href={`/teacher/courses/${courseId}/lessons/add?lessonId=${lesson._id}`}>
                  <PencilLine aria-hidden className="size-4" />
                </a>
              </Button>
              <Button
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (window.confirm(`Delete lesson "${lesson.title}"?`)) {
                    deleteMutation.mutate(lesson._id);
                  }
                }}
                size="sm"
                variant="secondary"
                type="button"
              >
                <Trash2 aria-hidden className="size-4" />
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

