"use client";

import { useQuery } from "@tanstack/react-query";
import { Brain, Lightbulb, TrendingUp } from "lucide-react";
import { studentFetchJson } from "@/components/student/api";
import { RecommendationCard } from "@/components/ai/RecommendationCard";
import type { ProgressAgentResult } from "@/lib/ai/agents/ProgressAgent";

export function ProgressInsights() {
  const query = useQuery({
    queryKey: ["ai-progress-insights"],
    queryFn: () => studentFetchJson<ProgressAgentResult>("/api/ai/progress/analyze", { method: "POST" }),
  });

  if (query.isLoading) {
    return <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Generating AI insights...</div>;
  }

  if (query.isError || !query.data) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">AI insights unavailable right now.</div>;
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card rounded-3xl p-5">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp aria-hidden className="size-4" />
            <p className="text-sm font-medium text-on-surface-variant">AI Summary</p>
          </div>
          <p className="mt-3 text-sm text-on-surface-variant">{query.data.overallSummary}</p>
        </div>
        <div className="glass-card rounded-3xl p-5">
          <div className="flex items-center gap-2 text-primary">
            <Brain aria-hidden className="size-4" />
            <p className="text-sm font-medium text-on-surface-variant">Skill Scores</p>
          </div>
          <div className="mt-3 space-y-2">
            {Object.entries(query.data.skillScores).map(([subject, score]) => (
              <div className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-sm" key={subject}>
                <span>{subject}</span>
                <strong>{score}%</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-3xl p-5">
          <div className="flex items-center gap-2 text-primary">
            <Lightbulb aria-hidden className="size-4" />
            <p className="text-sm font-medium text-on-surface-variant">Focus Areas</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {query.data.weakTopics.slice(0, 4).map((topic) => (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700" key={topic}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RecommendationCard description={query.data.recommendations[0] ?? "Keep practicing with short review sessions."} title="Top Recommendation" tone="positive" />
        <RecommendationCard description={query.data.recommendations[1] ?? "Use the AI tutor to ask follow-up questions."} title="Next Improvement" tone="warning" />
      </div>
    </section>
  );
}

