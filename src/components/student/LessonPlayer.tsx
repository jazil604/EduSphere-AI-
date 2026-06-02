"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Download, PlayCircle } from "lucide-react";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";

export type StudentLesson = {
  _id: string;
  title: string;
  content: string;
  videoUrl: string;
  notes: string[];
  order: number;
  duration: number;
  completed: boolean;
};

type LessonPlayerProps = {
  courseId: string;
  lesson: StudentLesson;
};

function getEmbeddedVideoUrl(url: string) {
  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }
  if (url.includes("youtu.be/")) {
    return url.replace("youtu.be/", "www.youtube.com/embed/");
  }
  return url;
}

export function LessonPlayer({ courseId, lesson }: LessonPlayerProps) {
  const queryClient = useQueryClient();
  const completeMutation = useMutation({
    mutationFn: () =>
      studentFetchJson(`/api/student/courses/${courseId}/progress`, {
        method: "PUT",
        body: JSON.stringify({ lessonId: lesson._id }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-course", courseId] });
      await queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
    },
  });

  return (
    <article className="glass-card rounded-3xl p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-on-surface-variant">#{lesson.order}</span>
            <h3 className="font-heading text-2xl font-semibold">{lesson.title}</h3>
          </div>
          <p className="mt-3 text-sm text-on-surface-variant">{lesson.content}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={completeMutation.isPending || lesson.completed}
            onClick={() => completeMutation.mutate()}
            size="sm"
            type="button"
          >
            <CheckCircle2 aria-hidden className="size-4" />
            {lesson.completed ? "Completed" : "Mark complete"}
          </Button>
          {lesson.videoUrl ? (
            <Button asChild size="sm" variant="secondary">
              <a href={lesson.videoUrl} rel="noreferrer" target="_blank">
                <PlayCircle aria-hidden className="size-4" />
                Open video
              </a>
            </Button>
          ) : null}
          {lesson.notes.length ? (
            <Button asChild size="sm" variant="secondary">
              <a
                download={`${lesson.title.replace(/\s+/g, "-").toLowerCase()}-notes.txt`}
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(lesson.notes.join("\n\n"))}`}
              >
                <Download aria-hidden className="size-4" />
                Download notes
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-3xl border border-outline-variant/50 bg-black/5">
          {lesson.videoUrl ? (
            lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be") ? (
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
                src={getEmbeddedVideoUrl(lesson.videoUrl)}
                title={lesson.title}
              />
            ) : (
              <video controls className="aspect-video w-full bg-black">
                <source src={lesson.videoUrl} />
                Your browser does not support the video element.
              </video>
            )
          ) : (
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-sky-100 via-emerald-100 to-indigo-100 text-sm text-on-surface-variant">
              No video attached to this lesson.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <section className="rounded-3xl border border-outline-variant/50 bg-white/70 p-5">
            <h4 className="font-heading text-lg font-semibold">Lesson Notes</h4>
            {lesson.notes.length ? (
              <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
                {lesson.notes.map((note, index) => (
                  <li className="rounded-2xl bg-surface-container-low px-4 py-3" key={`${lesson._id}-note-${index}`}>
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-on-surface-variant">No notes uploaded yet.</p>
            )}
          </section>

          <section className="rounded-3xl border border-outline-variant/50 bg-white/70 p-5">
            <h4 className="font-heading text-lg font-semibold">Lesson Details</h4>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-on-surface-variant">
              <span className="rounded-full bg-white/80 px-3 py-1">Duration: {lesson.duration || 0} min</span>
              <span className="rounded-full bg-white/80 px-3 py-1">Status: {lesson.completed ? "Complete" : "In progress"}</span>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
