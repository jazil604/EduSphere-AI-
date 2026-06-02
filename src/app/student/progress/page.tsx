"use client";

import { useQuery } from "@tanstack/react-query";
import { Brain, Clock3, Lightbulb, TrendingUp } from "lucide-react";
import { ProgressInsights } from "@/components/ai/ProgressInsights";
import { ProgressChart } from "@/components/student/ProgressChart";
import { StudentShell } from "@/components/student/StudentShell";
import { studentFetchJson } from "@/components/student/api";
import type { StudentProgressResponse } from "@/services/student.service";

export default function StudentProgressPage() {
  const query = useQuery({
    queryKey: ["student-progress"],
    queryFn: () => studentFetchJson<StudentProgressResponse>("/api/student/progress"),
  });

  const data = query.data;

  return (
    <StudentShell description="See how your course scores, quiz results, and study time are trending over time." title="Progress Tracking">
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading progress...</div>
      ) : query.isError || !data ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load progress.</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Overall progress</p>
                <TrendingUp aria-hidden className="size-5 text-primary" />
              </div>
              <p className="mt-4 font-heading text-4xl font-bold text-primary">{data.overallProgress}%</p>
            </article>
            <article className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Skill mastery</p>
                <Brain aria-hidden className="size-5 text-primary" />
              </div>
              <p className="mt-4 font-heading text-4xl font-bold text-primary">{data.skillMasteryLevels.length}</p>
            </article>
            <article className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Weak topics</p>
                <Lightbulb aria-hidden className="size-5 text-primary" />
              </div>
              <p className="mt-4 font-heading text-4xl font-bold text-primary">{data.weakTopics.length}</p>
            </article>
            <article className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Time spent</p>
                <Clock3 aria-hidden className="size-5 text-primary" />
              </div>
              <p className="mt-4 font-heading text-4xl font-bold text-primary">{data.timeSpentLearning.reduce((sum, entry) => sum + entry.value, 0)} min</p>
            </article>
          </div>

          <ProgressChart />

          <ProgressInsights />

          <section className="grid gap-4 xl:grid-cols-2">
            <article className="glass-card rounded-3xl p-6">
              <h2 className="font-heading text-2xl font-semibold">Weak Topics</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.weakTopics.length ? (
                  data.weakTopics.map((topic) => (
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700" key={topic}>
                      {topic}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant">No weak topics identified yet.</p>
                )}
              </div>
            </article>

            <article className="glass-card rounded-3xl p-6">
              <h2 className="font-heading text-2xl font-semibold">Recommendations</h2>
              <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
                {data.recommendations.length ? (
                  data.recommendations.map((recommendation) => (
                    <li className="rounded-2xl bg-white/70 px-4 py-3" key={recommendation}>
                      {recommendation}
                    </li>
                  ))
                ) : (
                  <li className="rounded-2xl bg-white/70 px-4 py-3">Keep practicing to unlock recommendations.</li>
                )}
              </ul>
            </article>
          </section>
        </div>
      )}
    </StudentShell>
  );
}
