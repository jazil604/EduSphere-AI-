import { AdminShell } from "@/components/admin/AdminShell";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

export default function AdminAnalyticsPage() {
  return (
    <AdminShell
      description="Visualize adoption, engagement, and performance trends across the learning platform."
      title="Platform Analytics"
    >
      <AnalyticsCharts />
    </AdminShell>
  );
}

