"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BookOpen, GraduationCap, LineChart, ShieldCheck, Users } from "lucide-react";
import { adminFetchJson } from "@/components/admin/api";
import type { AnalyticsResponse } from "@/services/admin.service";

const cards = [
  { key: "totalStudents", label: "Total Students", icon: GraduationCap },
  { key: "totalTeachers", label: "Total Teachers", icon: Users },
  { key: "totalCourses", label: "Total Courses", icon: BookOpen },
  { key: "totalQuizzes", label: "Total Quizzes", icon: LineChart },
  { key: "activeUsersToday", label: "Active Users Today", icon: ShieldCheck },
  { key: "averagePerformanceScore", label: "Average Performance Score", icon: ArrowUpRight },
] as const;

export function StatsCards() {
  const query = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminFetchJson<AnalyticsResponse>("/api/admin/analytics"),
  });

  if (query.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        Failed to load dashboard statistics.
      </div>
    );
  }

  const stats = query.data?.stats;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats ? stats[card.key] : 0;
        return (
          <article className="glass-card rounded-3xl p-6" key={card.label}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-on-surface-variant">{card.label}</p>
              <div className="ai-gradient flex size-10 items-center justify-center rounded-2xl text-white">
                <Icon aria-hidden className="size-4" />
              </div>
            </div>
            <p className="mt-4 font-heading text-4xl font-bold text-primary">{value}</p>
          </article>
        );
      })}
    </div>
  );
}

