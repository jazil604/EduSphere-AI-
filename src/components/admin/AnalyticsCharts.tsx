"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminFetchJson } from "@/components/admin/api";
import type { AnalyticsResponse } from "@/services/admin.service";

const palette = ["#2563eb", "#0f766e", "#14b8a6", "#f97316", "#8b5cf6", "#ef4444"];

export function AnalyticsCharts() {
  const query = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminFetchJson<AnalyticsResponse>("/api/admin/analytics"),
  });

  if (query.isLoading) {
    return <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading analytics...</div>;
  }

  if (query.isError) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load analytics.</div>;
  }

  const data = query.data;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="glass-card rounded-3xl p-6">
        <div className="mb-4">
          <h2 className="font-heading text-2xl font-semibold">Daily Active Users</h2>
          <p className="text-sm text-on-surface-variant">Last 7 days of platform activity.</p>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.dailyActiveUsers ?? []}>
              <CartesianGrid strokeDasharray="4 4" stroke="#dbeafe" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <div className="mb-4">
          <h2 className="font-heading text-2xl font-semibold">Course Enrollment Trends</h2>
          <p className="text-sm text-on-surface-variant">Enrolled students per recent course.</p>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.courseEnrollmentTrends ?? []}>
              <CartesianGrid strokeDasharray="4 4" stroke="#dbeafe" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0f766e" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <div className="mb-4">
          <h2 className="font-heading text-2xl font-semibold">Quiz Performance Distribution</h2>
          <p className="text-sm text-on-surface-variant">Score buckets based on submitted quizzes.</p>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data?.quizPerformanceDistribution ?? []}
                dataKey="value"
                nameKey="name"
                innerRadius={78}
                outerRadius={120}
                paddingAngle={4}
              >
                {(data?.quizPerformanceDistribution ?? []).map((entry, index) => (
                  <Cell fill={palette[index % palette.length]} key={entry.name} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <div className="mb-4">
          <h2 className="font-heading text-2xl font-semibold">Revenue Overview</h2>
          <p className="text-sm text-on-surface-variant">Future-ready placeholder for monetization analytics.</p>
        </div>
        <div className="h-[320px] rounded-2xl border border-dashed border-outline-variant/50 bg-white/50 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.revenueOverview ?? []}>
              <CartesianGrid strokeDasharray="4 4" stroke="#dbeafe" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

