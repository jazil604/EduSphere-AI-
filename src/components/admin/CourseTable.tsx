"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminFetchJson } from "@/components/admin/api";
import type { AdminCourseListItem } from "@/services/admin.service";

export function CourseTable() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => adminFetchJson<AdminCourseListItem[]>("/api/admin/courses"),
  });

  const deleteMutation = useMutation({
    mutationFn: (courseId: string) =>
      adminFetchJson<{ ok: boolean }>("/api/admin/courses", {
        method: "DELETE",
        body: JSON.stringify({ id: courseId }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
  });

  if (query.isLoading) {
    return <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading courses...</div>;
  }

  if (query.isError) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load courses.</div>;
  }

  return (
    <div className="glass-card overflow-hidden rounded-3xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-outline-variant/40">
          <thead className="bg-white/50">
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              <th className="px-5 py-4">Course</th>
              <th className="px-5 py-4">Teacher</th>
              <th className="px-5 py-4">Enrollments</th>
              <th className="px-5 py-4">Completion</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 bg-white/40">
            {query.data?.map((course) => (
              <tr key={course._id}>
                <td className="px-5 py-4">
                  <div>
                    <p className="font-semibold text-primary">{course.title}</p>
                    <p className="text-sm text-on-surface-variant">{course.subject || "General"}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">{course.teacherName}</td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">{course.enrollmentCount}</td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">{course.completionRate}%</td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">
                  <span className={course.isPublished ? "rounded-full bg-emerald-100 px-3 py-1 text-emerald-700" : "rounded-full bg-amber-100 px-3 py-1 text-amber-700"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Button
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (window.confirm(`Delete ${course.title}? This also removes lessons and quizzes.`)) {
                        deleteMutation.mutate(course._id);
                      }
                    }}
                    size="sm"
                    variant="secondary"
                    type="button"
                  >
                    <Trash2 aria-hidden className="size-4" />
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteMutation.isError ? (
        <div className="flex items-center gap-2 border-t border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          <AlertTriangle aria-hidden className="size-4" />
          Failed to delete the course.
        </div>
      ) : null}
    </div>
  );
}

