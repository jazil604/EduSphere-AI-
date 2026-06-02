"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";
import type { TeacherQuiz } from "@/components/teacher/QuizBuilder";

export default function TeacherQuizzesPage() {
  const query = useQuery({
    queryKey: ["teacher-quizzes"],
    queryFn: () => teacherFetchJson<TeacherQuiz[]>("/api/teacher/quizzes"),
  });

  return (
    <TeacherShell description="Build quizzes, set scoring rules, and review student results." title="Quiz Management">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/teacher/quizzes/create">
            <PlusCircle aria-hidden className="size-4" />
            Create quiz
          </Link>
        </Button>
      </div>

      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading quizzes...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load quizzes.</div>
      ) : (
        <div className="space-y-4">
          {query.data?.map((quiz) => (
            <article className="glass-card rounded-3xl p-5" key={quiz._id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-heading text-2xl font-semibold">{quiz.title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">{quiz.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/teacher/quizzes/${quiz._id}/edit`}>Edit</Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/teacher/quizzes/${quiz._id}/results`}>Results</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </TeacherShell>
  );
}

