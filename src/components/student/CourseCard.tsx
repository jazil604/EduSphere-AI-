"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Trash2 } from "lucide-react";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";

export type StudentCourseCardData = {
  _id: string;
  title: string;
  description: string;
  subject: string;
  thumbnail: string;
  enrollmentCode: string;
  teacherName: string;
  progress: number;
  lessonCount: number;
  completedLessons: number;
  isEnrolled: boolean;
};

type CourseCardProps = {
  course: StudentCourseCardData;
  onLeave?: () => void;
};

export function CourseCard({ course, onLeave }: CourseCardProps) {
  const queryClient = useQueryClient();
  const leaveMutation = useMutation({
    mutationFn: () =>
      studentFetchJson(`/api/student/courses/${course._id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      onLeave?.();
    },
  });

  return (
    <article className="glass-card overflow-hidden rounded-3xl">
      <div className="aspect-[16/8] bg-gradient-to-br from-sky-100 via-emerald-100 to-indigo-100" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-2xl font-semibold">{course.title}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">{course.subject || "General subject"}</p>
          </div>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-on-surface-variant">{course.progress}%</span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm text-on-surface-variant">{course.description}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-on-surface-variant">
          <span className="rounded-full bg-white/70 px-3 py-1">Lessons: {course.lessonCount}</span>
          <span className="rounded-full bg-white/70 px-3 py-1">Completed: {course.completedLessons}</span>
          <span className="rounded-full bg-white/70 px-3 py-1">Teacher: {course.teacherName}</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href={`/student/courses/${course._id}`}>
              <BookOpen aria-hidden className="size-4" />
              Open
            </Link>
          </Button>
          {course.isEnrolled ? (
            <Button
              disabled={leaveMutation.isPending}
              onClick={() => {
                if (window.confirm(`Leave course "${course.title}"?`)) {
                  leaveMutation.mutate();
                }
              }}
              size="sm"
              variant="secondary"
              type="button"
            >
              <Trash2 aria-hidden className="size-4" />
              Leave
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
