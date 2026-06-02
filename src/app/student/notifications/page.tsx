"use client";

import { Bell } from "lucide-react";
import { NotificationList } from "@/components/student/NotificationList";
import { StudentShell } from "@/components/student/StudentShell";

export default function StudentNotificationsPage() {
  return (
    <StudentShell description="Stay up to date with course updates, deadlines, quiz reminders, and teacher announcements." title="Notifications">
      <div className="glass-card rounded-3xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="ai-gradient flex size-11 items-center justify-center rounded-2xl text-white">
            <Bell aria-hidden className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold">Inbox</h2>
            <p className="text-sm text-on-surface-variant">Mark messages read or unread as you manage your learning flow.</p>
          </div>
        </div>
        <NotificationList />
      </div>
    </StudentShell>
  );
}
