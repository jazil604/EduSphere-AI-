"use client";

import { useQuery } from "@tanstack/react-query";
import type { ComponentType } from "react";
import { BadgeCheck, Bot, Eye, UserCog } from "lucide-react";
import { adminFetchJson } from "@/components/admin/api";
import type { ActivityLogItem } from "@/services/admin.service";

const icons: Record<string, ComponentType<{ className?: string }>> = {
  USER_CREATED: UserCog,
  USER_UPDATED: BadgeCheck,
  USER_DELETED: Eye,
  TEACHER_APPROVED: BadgeCheck,
  TEACHER_REJECTED: Eye,
  COURSE_DELETED: Eye,
  ANNOUNCEMENT_CREATED: Bot,
  ANNOUNCEMENT_UPDATED: Bot,
  ANNOUNCEMENT_DELETED: Eye,
};

export function ActivityFeed() {
  const query = useQuery({
    queryKey: ["admin-activity"],
    queryFn: () => adminFetchJson<{ items: ActivityLogItem[] }>("/api/admin/audit-logs?limit=10"),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="glass-card rounded-3xl p-4" key={index}>
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200/70" />
            <div className="mt-3 h-3 w-64 animate-pulse rounded-full bg-slate-200/70" />
          </div>
        ))}
      </div>
    );
  }

  if (query.isError) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load activity feed.</div>;
  }

  return (
    <div className="space-y-3">
      {query.data?.items.map((item) => {
        const Icon = icons[item.action] ?? UserCog;
        return (
          <article className="glass-card flex gap-4 rounded-3xl p-4" key={item._id}>
            <div className="ai-gradient flex size-10 shrink-0 items-center justify-center rounded-2xl text-white">
              <Icon aria-hidden className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-primary">{item.action.replaceAll("_", " ")}</p>
                <span className="text-xs text-on-surface-variant">{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-sm text-on-surface-variant">
                {item.user?.name ?? "System"} changed {item.entityType}
                {item.entityId ? ` #${item.entityId}` : ""}.
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
