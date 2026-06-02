"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { teacherFetchJson } from "@/components/teacher/api";
import type { TeacherAnalyticsResponse } from "@/services/teacher.service";
import { Button } from "@/components/ui/button";

export default function TeacherAnalyticsPage() {
  const query = useQuery({
    queryKey: ["teacher-analytics-full"],
    queryFn: () => teacherFetchJson<TeacherAnalyticsResponse>("/api/teacher/analytics"),
  });

  function exportReport() {
    if (!query.data) return;
    const rows = [
      ["Metric", "Label", "Value"],
      ...query.data.courseCompletionRates.map((item) => ["Course completion", item.label, String(item.value)]),
      ...query.data.quizPerformanceTrends.map((item) => ["Quiz performance", item.label, String(item.value)]),
      ...query.data.studentProgressOverTime.map((item) => ["Student progress", item.label, String(item.value)]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "teacher-analytics.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <TeacherShell description="Review completion rates, quiz trends, and progress over time." title="Analytics">
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading analytics...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load analytics.</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="glass-card rounded-3xl p-6">
            <h2 className="font-heading text-2xl font-semibold">Course Completion Rates</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={query.data?.courseCompletionRates ?? []}>
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
            <h2 className="font-heading text-2xl font-semibold">Quiz Performance Trends</h2>
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

          <section className="glass-card rounded-3xl p-6 xl:col-span-2">
            <h2 className="font-heading text-2xl font-semibold">Student Progress Over Time</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={query.data?.studentProgressOverTime ?? []}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="xl:col-span-2 flex justify-end">
            <Button variant="secondary" type="button" onClick={exportReport}>
              Export report
            </Button>
          </div>
        </div>
      )}
    </TeacherShell>
  );
}
