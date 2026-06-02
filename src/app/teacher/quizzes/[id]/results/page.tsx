"use client";

import { useQuery } from "@tanstack/react-query";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { teacherFetchJson } from "@/components/teacher/api";
import { useParams } from "next/navigation";

export default function TeacherQuizResultsPage() {
  const params = useParams<{ id: string }>();
  const query = useQuery({
    queryKey: ["teacher-quiz-results", params.id],
    queryFn: async () => teacherFetchJson(`/api/teacher/quizzes?resultsFor=${params.id}`),
  });

  return (
    <TeacherShell description="Review quiz outcomes and identify class-wide gaps." title="Quiz Results">
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading results...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load results.</div>
      ) : (
        <div className="glass-card rounded-3xl p-6">
          <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-on-surface-variant">
            {JSON.stringify(query.data, null, 2)}
          </pre>
        </div>
      )}
    </TeacherShell>
  );
}

