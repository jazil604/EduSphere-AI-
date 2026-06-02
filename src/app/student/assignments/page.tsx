"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Download, FileUp, PenSquare } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";
import type { StudentAssignmentSummary } from "@/services/student.service";

export default function StudentAssignmentsPage() {
  const query = useQuery({
    queryKey: ["student-assignments"],
    queryFn: () => studentFetchJson<StudentAssignmentSummary[]>("/api/student/assignments"),
  });

  return (
    <StudentShell description="Track pending work, review graded submissions, and upload your files from one place." title="Assignments">
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading assignments...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load assignments.</div>
      ) : (
        <div className="space-y-4">
          {query.data?.map((assignment) => (
            <article className="glass-card rounded-3xl p-6" key={assignment._id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-2xl font-semibold text-primary">{assignment.title}</h2>
                    <span className={assignment.status === "graded" ? "rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700" : assignment.status === "submitted" ? "rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700" : "rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700"}>
                      {assignment.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-on-surface-variant">{assignment.description}</p>
                  <p className="mt-2 text-xs text-on-surface-variant">
                    Course: {assignment.courseTitle} | Due: {new Date(assignment.dueDate).toLocaleString()} | Max score: {assignment.maxScore}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/student/assignments/${assignment._id}/submit`}>
                      <PenSquare aria-hidden className="size-4" />
                      Submit
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {assignment.attachments.length ? (
                  assignment.attachments.map((file, index) => (
                    <a
                      className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs text-on-surface-variant hover:text-primary"
                      href={file}
                      key={`${assignment._id}-attachment-${index}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Download aria-hidden className="size-3.5" />
                      Attachment {index + 1}
                    </a>
                  ))
                ) : (
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-on-surface-variant">No attachments</span>
                )}
              </div>

              {assignment.status !== "pending" ? (
                <div className="mt-4 rounded-3xl border border-outline-variant/40 bg-white/70 p-4 text-sm text-on-surface-variant">
                  <p>Score: {assignment.score ?? "Not graded yet"}</p>
                  <p className="mt-2">Feedback: {assignment.feedback || "Teacher feedback will appear here."}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </StudentShell>
  );
}
