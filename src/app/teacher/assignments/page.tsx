"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, PencilLine } from "lucide-react";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";
import type { TeacherAssignmentItem } from "@/services/teacher.service";

export default function TeacherAssignmentsPage() {
  const query = useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: () => teacherFetchJson<TeacherAssignmentItem[]>("/api/teacher/assignments"),
  });

  return (
    <TeacherShell description="Create assignments, track submissions, and provide feedback at scale." title="Assignment Management">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/teacher/assignments/create">
            <PlusCircle aria-hidden className="size-4" />
            Create assignment
          </Link>
        </Button>
      </div>

      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading assignments...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load assignments.</div>
      ) : (
        <div className="space-y-4">
          {query.data?.map((assignment) => (
            <article className="glass-card rounded-3xl p-5" key={assignment._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-2xl font-semibold">{assignment.title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">{assignment.description}</p>
                </div>
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-on-surface-variant">
                  Due {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/teacher/assignments/${assignment._id}/grade`}>
                    <PencilLine aria-hidden className="size-4" />
                    Grade
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </TeacherShell>
  );
}

