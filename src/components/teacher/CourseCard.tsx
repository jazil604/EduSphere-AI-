"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit3, Layers3, Trash2 } from "lucide-react";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";

export type TeacherCourseCardData = {
  _id: string;
  title: string;
  description: string;
  subject: string;
  thumbnail: string;
  enrollmentCode: string;
  isPublished: boolean;
  lessonCount: number;
  enrollmentCount: number;
  completionRate: number;
};

type CourseCardProps = {
  course: TeacherCourseCardData;
};

export function CourseCard({ course }: CourseCardProps) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () =>
      teacherFetchJson(`/api/teacher/courses/${course._id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["teacher-analytics"] });
    },
  });

  return (
    <article className="glass-card overflow-hidden rounded-3xl">
      <div className="aspect-[16/8] bg-gradient-to-br from-emerald-100 via-sky-100 to-indigo-100" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-2xl font-semibold">{course.title}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">{course.subject || "General subject"}</p>
          </div>
          <span className={course.isPublished ? "rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700" : "rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700"}>
            {course.isPublished ? "Published" : "Draft"}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm text-on-surface-variant">{course.description}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-on-surface-variant">
          <span className="rounded-full bg-white/70 px-3 py-1">Lessons: {course.lessonCount}</span>
          <span className="rounded-full bg-white/70 px-3 py-1">Students: {course.enrollmentCount}</span>
          <span className="rounded-full bg-white/70 px-3 py-1">Completion: {course.completionRate}%</span>
          <span className="rounded-full bg-white/70 px-3 py-1">Code: {course.enrollmentCode}</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href={`/teacher/courses/${course._id}`}>
              <Edit3 aria-hidden className="size-4" />
              Edit
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href={`/teacher/courses/${course._id}/lessons`}>
              <Layers3 aria-hidden className="size-4" />
              Lessons
            </Link>
          </Button>
          <Button
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (window.confirm(`Delete course "${course.title}"?`)) {
                deleteMutation.mutate();
              }
            }}
            size="sm"
            variant="secondary"
            type="button"
          >
            <Trash2 aria-hidden className="size-4" />
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}

