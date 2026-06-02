"use client";

import { useQuery } from "@tanstack/react-query";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { teacherFetchJson } from "@/components/teacher/api";
import { GradeModal } from "@/components/teacher/GradeModal";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type SubmissionRow = {
  _id: string;
  assignmentId: string;
  student: { id: string; name: string; email: string } | null;
  submittedAt: string;
  score: number | null;
  feedback: string;
  attachments: string[];
  content: string;
  gradedAt: string | null;
};

export default function TeacherGradeAssignmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["teacher-assignment-submissions", params.id],
    queryFn: () => teacherFetchJson<SubmissionRow[]>(`/api/teacher/assignments?assignmentId=${params.id}`),
  });

  return (
    <TeacherShell description="Review submissions and assign scores with feedback." title="Grade Submissions">
      <div className="flex justify-end">
        <Button onClick={() => router.back()} type="button" variant="secondary">
          Go back
        </Button>
      </div>

      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading submissions...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load submissions.</div>
      ) : (
        <div className="space-y-4">
          {query.data?.length ? (
            query.data.map((submission) => (
              <article className="glass-card rounded-3xl p-5" key={submission._id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-heading text-2xl font-semibold">{submission.student?.name ?? "Student"}</h3>
                    <p className="text-sm text-on-surface-variant">{submission.student?.email ?? ""}</p>
                    <p className="mt-2 text-sm text-on-surface-variant">{submission.content || "No written response provided."}</p>
                    <p className="mt-2 text-xs text-on-surface-variant">Submitted {new Date(submission.submittedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-on-surface-variant">
                      {submission.score ?? "Ungraded"}
                    </span>
                    <Button onClick={() => setSubmissionId(submission._id)} size="sm" type="button">
                      Grade submission
                    </Button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">No submissions yet.</div>
          )}
        </div>
      )}

      {submissionId ? (
        <GradeModal assignmentId={params.id} onClose={() => setSubmissionId(null)} submissionId={submissionId} />
      ) : null}
    </TeacherShell>
  );
}
