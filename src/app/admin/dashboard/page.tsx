"use client";

import Link from "next/link";
import { ArrowRight, UserCog, Users, BookOpen, LineChart, BellRing } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { StatsCards } from "@/components/admin/StatsCards";
import { Button } from "@/components/ui/button";

const quickActions = [
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/courses", label: "Review Courses", icon: BookOpen },
  { href: "/admin/analytics", label: "Open Analytics", icon: LineChart },
  { href: "/admin/announcements", label: "Post Announcement", icon: BellRing },
];

export default function AdminDashboardPage() {
  return (
    <AdminShell
      description="A live command center for platform health, user moderation, learning analytics, and announcements."
      title="Platform Overview"
    >
      <section>
        <StatsCards />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="glass-card rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Recent Activity</h2>
              <p className="text-sm text-on-surface-variant">Last 10 platform actions across admin workflows.</p>
            </div>
          </div>
          <ActivityFeed />
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-heading text-2xl font-semibold">Quick Actions</h2>
            <div className="mt-4 grid gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button asChild className="justify-between" key={action.href} variant="secondary">
                    <Link href={action.href}>
                      <span className="flex items-center gap-3">
                        <Icon aria-hidden className="size-4" />
                        {action.label}
                      </span>
                      <ArrowRight aria-hidden className="size-4" />
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="ai-gradient flex size-11 items-center justify-center rounded-2xl text-white">
                <UserCog aria-hidden className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-semibold">Moderation Note</h2>
                <p className="text-sm text-on-surface-variant">Keep teacher approvals and user blocks up to date.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-on-surface-variant">
              Audit logs and analytics are updated from real admin actions, so the dashboard stays trustworthy as the platform scales.
            </p>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
