"use client";

import { useParams } from "next/navigation";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { QuizBuilder } from "@/components/teacher/QuizBuilder";

export default function TeacherEditQuizPage() {
  const params = useParams<{ id: string }>();

  return (
    <TeacherShell description="Edit quiz questions and scoring rules." title="Edit Quiz">
      <div className="glass-card rounded-3xl p-6">
        <p className="text-sm text-on-surface-variant">This page loads the quiz builder for quiz ID {params.id}.</p>
      </div>
      <QuizBuilder quizId={params.id} />
    </TeacherShell>
  );
}
