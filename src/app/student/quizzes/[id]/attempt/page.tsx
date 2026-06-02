"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use } from "react";
import { StudentShell } from "@/components/student/StudentShell";
import { QuizPlayer } from "@/components/student/QuizPlayer";
import { studentFetchJson } from "@/components/student/api";
import type { QuizAttemptResponse } from "@/services/student.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function StudentQuizAttemptPage({ params }: PageProps) {
  const router = useRouter();
  const { id: quizId } = use(params);
  const query = useQuery({
    queryKey: ["student-quiz", quizId],
    queryFn: () => studentFetchJson<QuizAttemptResponse>(`/api/student/quizzes/${quizId}/attempt`),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: { answers: Array<{ questionId: string; answer: string }>; timeTaken: number }) =>
      studentFetchJson(`/api/student/quizzes/${quizId}/attempt`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      router.push(`/student/quizzes/${quizId}/results`);
      router.refresh();
    },
  });

  return (
      <StudentShell description="Answer carefully, keep an eye on the timer, and submit when you’re ready." title="Quiz Attempt">
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading quiz...</div>
      ) : query.isError || !query.data ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load quiz.</div>
      ) : (
        <QuizPlayer
          isSubmitting={submitMutation.isPending}
          onSubmit={async (payload) => {
            await submitMutation.mutateAsync(payload);
          }}
          quiz={query.data}
        />
      )}
    </StudentShell>
  );
}
