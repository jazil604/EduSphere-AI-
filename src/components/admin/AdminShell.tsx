"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BellRing,
  BookOpen,
  LayoutDashboard,
  LineChart,
  Logs,
  UserCog,
  Users,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/analytics", label: "Analytics", icon: LineChart },
  { href: "/admin/announcements", label: "Announcements", icon: BellRing },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: Logs },
];

type AdminShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AdminShell({ title, description, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),#f7fbff]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-5 px-4 py-4 lg:grid-cols-[280px_1fr]">
        <aside className="glass-card rounded-3xl p-5 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div className="flex items-center gap-3">
            <div className="ai-gradient flex size-11 items-center justify-center rounded-2xl text-white">
              <UserCog aria-hidden className="size-6" />
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-primary">EduSphere AI</p>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-secondary">Admin Console</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-on-surface-variant hover:bg-surface-container-low",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <Icon aria-hidden className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-outline-variant/60 bg-white/70 p-4">
            <p className="font-heading text-lg font-semibold">Admin quick note</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Manage platform access, review activity, and keep the learning environment healthy.
            </p>
          </div>

          <div className="mt-6">
            <LogoutButton />
          </div>
        </aside>

        <section className="space-y-6 py-2 lg:py-4">
          <header className="glass-card rounded-3xl p-6">
            <p className="font-mono text-sm uppercase tracking-[0.28em] text-secondary">Admin dashboard</p>
            <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="font-heading text-4xl font-bold">{title}</h1>
                {description ? <p className="mt-2 max-w-3xl text-sm text-on-surface-variant">{description}</p> : null}
              </div>
            </div>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
