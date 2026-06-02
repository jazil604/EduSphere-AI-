"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, Brain, Flame, LineChart } from "lucide-react";
import { studentFetchJson } from "@/components/student/api";
import type { StudentDashboardResponse } from "@/services/student.service";

const cards = [
  { key: "coursesEnrolled", label: "Courses Enrolled", icon: BookOpen },
  { key: "completedQuizzes", label: "Completed Quizzes", icon: Brain },
  { key: "averageScore", label: "Average Score", icon: LineChart },
  { key: "learningStreak", label: "Learning Streak", icon: Flame },
] as const;

export function StatsCards() {
  const query = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: () => studentFetchJson<StudentDashboardResponse>("/api/student"),
  });

  if (query.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div className="glass-card rounded-3xl p-6" key={card.label}>
            <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200/70" />
            <div className="mt-4 h-10 w-20 animate-pulse rounded-2xl bg-slate-200/70" />
          </div>
        ))}
      </div>
    );
  }

  if (query.isError) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load student overview.</div>;
  }

  const stats = query.data?.stats;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats ? stats[card.key] : 0;
        return (
          <article className="glass-card rounded-3xl p-6" key={card.label}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-on-surface-variant">{card.label}</p>
              <div className="ai-gradient flex size-10 items-center justify-center rounded-2xl text-white">
                <Icon aria-hidden className="size-4" />
              </div>
            </div>
            <p className="mt-4 font-heading text-4xl font-bold text-primary">
              {card.key === "averageScore" ? `${value}%` : value}
              {card.key === "learningStreak" ? " days" : null}
            </p>
          </article>
        );
      })}
    </div>
  );
}
