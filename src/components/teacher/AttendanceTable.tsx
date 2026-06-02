"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, LoaderCircle, Printer } from "lucide-react";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";

export type AttendanceRecord = {
  _id: string;
  student: { name: string; email: string } | null;
  course: { title: string } | null;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  markedBy: string;
};

type AttendanceTableProps = {
  courseId?: string;
};

export function AttendanceTable({ courseId }: AttendanceTableProps) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["teacher-attendance", courseId],
    queryFn: () => teacherFetchJson<AttendanceRecord[]>(`/api/teacher/attendance${courseId ? `?courseId=${courseId}` : ""}`),
  });

  const mutation = useMutation({
    mutationFn: (payload: Array<{ studentId: string; courseId: string; date: string; status: AttendanceRecord["status"] }>) =>
      teacherFetchJson("/api/teacher/attendance", {
        method: "POST",
        body: JSON.stringify({ entries: payload }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teacher-attendance"] });
    },
  });

  async function exportCsv() {
    const response = await fetch(`/api/teacher/attendance?format=csv${courseId ? `&courseId=${courseId}` : ""}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (query.isLoading) return <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading attendance...</div>;
  if (query.isError) return <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load attendance.</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => window.print()} size="sm" type="button" variant="secondary">
            <Printer aria-hidden className="size-4" />
            Save as PDF
          </Button>
          <Button onClick={() => void exportCsv()} size="sm" type="button" variant="secondary">
            <Download aria-hidden className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>
      <div className="glass-card overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant/40">
            <thead className="bg-white/50">
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 bg-white/40">
              {query.data?.map((row) => (
                <tr key={row._id}>
                  <td className="px-5 py-4 text-sm text-on-surface-variant">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-sm text-on-surface-variant">{row.student?.name ?? "Student"}</td>
                  <td className="px-5 py-4 text-sm text-on-surface-variant">{row.course?.title ?? "Course"}</td>
                  <td className="px-5 py-4 text-sm text-on-surface-variant">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mutation.isPending ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
          Saving attendance...
        </div>
      ) : null}
    </div>
  );
}
