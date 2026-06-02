"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { studentFetchJson } from "@/components/student/api";
import type { StudentProgressResponse } from "@/services/student.service";

export function ProgressChart() {
  const query = useQuery({
    queryKey: ["student-progress"],
    queryFn: () => studentFetchJson<StudentProgressResponse>("/api/student/progress"),
  });

  if (query.isLoading) return <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading progress...</div>;
  if (query.isError) return <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load progress.</div>;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="glass-card rounded-3xl p-6">
        <h2 className="font-heading text-2xl font-semibold">Course Performance</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={query.data?.courseWisePerformance ?? []}>
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="glass-card rounded-3xl p-6">
        <h2 className="font-heading text-2xl font-semibold">Quiz Trend</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={query.data?.quizPerformanceTrends ?? []}>
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
