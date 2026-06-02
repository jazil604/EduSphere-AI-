"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";
import type { StudentQuizSummary } from "@/services/student.service";

export default function StudentQuizzesPage() {
  const query = useQuery({
    queryKey: ["student-quizzes"],
    queryFn: () => studentFetchJson<StudentQuizSummary[]>("/api/student/quizzes"),
  });

  return (
    <StudentShell description="Take quizzes, track your history, and review where you’re improving." title="Quiz Center">
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading quizzes...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load quizzes.</div>
      ) : (
        <div className="space-y-6">
          <section className="glass-card rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-semibold">Available Quizzes</h2>
                <p className="text-sm text-on-surface-variant">Choose a quiz and start an attempt with a live timer.</p>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-on-surface-variant">{query.data?.length ?? 0} quizzes</span>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {query.data?.map((quiz) => (
                <article className="rounded-3xl border border-outline-variant/40 bg-white/70 p-5" key={quiz._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-2xl font-semibold text-primary">{quiz.title}</h3>
                      <p className="mt-2 text-sm text-on-surface-variant">{quiz.description}</p>
                    </div>
                    <span className={quiz.hasAttempted ? "rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700" : "rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700"}>
                      {quiz.hasAttempted ? "Attempted" : "New"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                    <span className="rounded-full bg-white px-3 py-1">Course: {quiz.courseTitle}</span>
                    <span className="rounded-full bg-white px-3 py-1">Lesson: {quiz.lessonTitle}</span>
                    <span className="rounded-full bg-white px-3 py-1">Level: {quiz.difficulty}</span>
                    <span className="rounded-full bg-white px-3 py-1">
                      <Clock3 aria-hidden className="mr-1 inline size-3" />
                      {quiz.timeLimit ? `${quiz.timeLimit} min` : "No timer"}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link href={`/student/quizzes/${quiz._id}/attempt`}>
                        <Sparkles aria-hidden className="size-4" />
                        Attempt
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/student/quizzes/${quiz._id}/results`}>
                        <CheckCircle2 aria-hidden className="size-4" />
                        Results
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/student/courses`}>
                        <ArrowRight aria-hidden className="size-4" />
                        Go to course
                      </Link>
                    </Button>
                  </div>

                  <p className="mt-4 text-xs text-on-surface-variant">Best score: {quiz.bestScore}% | Passing score: {quiz.passingScore}%</p>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-3xl p-6">
            <h2 className="font-heading text-2xl font-semibold">Quiz History</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Use the results page to revisit your performance and explanations.</p>
          </section>
        </div>
      )}
    </StudentShell>
  );
}
