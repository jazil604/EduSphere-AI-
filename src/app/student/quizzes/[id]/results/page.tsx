"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";
import type { QuizAttemptResponse } from "@/services/student.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function StudentQuizResultsPage({ params }: PageProps) {
  const { id: quizId } = use(params);
  const query = useQuery({
    queryKey: ["student-quiz-results", quizId],
    queryFn: () => studentFetchJson<QuizAttemptResponse>(`/api/student/quizzes/${quizId}/attempt`),
  });

  const submission = query.data?.existingSubmission;
  const questions = query.data?.questions ?? [];

  return (
    <StudentShell description="See your score, review each answer, and head back into learning." title="Quiz Results">
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading results...</div>
      ) : query.isError || !query.data ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load quiz results.</div>
      ) : !submission ? (
        <div className="glass-card rounded-3xl p-6">
          <p className="text-sm text-on-surface-variant">You have not submitted this quiz yet.</p>
          <Button asChild className="mt-4">
            <Link href={`/student/quizzes/${quizId}/attempt`}>
              <ArrowLeft aria-hidden className="size-4" />
              Start attempt
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-4">
            <div className="glass-card rounded-3xl p-6">
              <p className="font-mono text-sm uppercase tracking-[0.28em] text-secondary">{query.data.course.title}</p>
              <h1 className="mt-2 font-heading text-3xl font-bold">{query.data.quiz.title}</h1>
              <p className="mt-2 text-sm text-on-surface-variant">{query.data.quiz.description}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4">
                  <p className="text-sm text-on-surface-variant">Score</p>
                  <p className="mt-1 font-heading text-3xl font-bold text-primary">{submission.percentage}%</p>
                </div>
                <div className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4">
                  <p className="text-sm text-on-surface-variant">Status</p>
                  <p className="mt-1 font-heading text-3xl font-bold text-primary">{submission.percentage >= query.data.quiz.passingScore ? "Passed" : "Needs review"}</p>
                </div>
                <div className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4">
                  <p className="text-sm text-on-surface-variant">Time taken</p>
                  <p className="mt-1 font-heading text-3xl font-bold text-primary">{Math.max(0, Math.round(submission.timeTaken / 60))} min</p>
                </div>
                <div className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4">
                  <p className="text-sm text-on-surface-variant">Answers</p>
                  <p className="mt-1 font-heading text-3xl font-bold text-primary">{submission.answers.length}</p>
                </div>
              </div>

              <p className="mt-4 rounded-3xl bg-surface-container-low p-4 text-sm text-on-surface-variant">{submission.feedback}</p>
            </div>

            <Button asChild className="w-full" variant="secondary">
              <Link href="/student/quizzes">
                <ArrowLeft aria-hidden className="size-4" />
                Back to quizzes
              </Link>
            </Button>
          </aside>

          <section className="glass-card rounded-3xl p-6">
            <h2 className="font-heading text-2xl font-semibold">Answer Review</h2>
            <div className="mt-5 space-y-4">
              {questions.map((question, index) => {
                const answer = submission.answers.find((item) => item.questionId === question._id);
                const isCorrect = answer?.isCorrect ?? false;

                return (
                  <article className="rounded-3xl border border-outline-variant/40 bg-white/70 p-5" key={question._id}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.24em] text-secondary">Question {index + 1}</p>
                        <h3 className="mt-2 font-heading text-xl font-semibold">{question.text}</h3>
                      </div>
                      <span className={isCorrect ? "inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700" : "inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700"}>
                        {isCorrect ? <CheckCircle2 aria-hidden className="size-3.5" /> : <XCircle aria-hidden className="size-3.5" />}
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>

                    <div className="mt-4 rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                      Your answer: <strong className="text-primary">{answer?.answer || "Not answered"}</strong>
                    </div>

                    {question.explanation ? <p className="mt-3 text-sm text-on-surface-variant">Explanation: {question.explanation}</p> : null}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </StudentShell>
  );
}
