"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MailOpen, MailWarning } from "lucide-react";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";
import type { StudentNotificationItem } from "@/services/student.service";

export function NotificationList() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["student-notifications"],
    queryFn: () => studentFetchJson<StudentNotificationItem[]>("/api/student/notifications"),
  });

  const mutation = useMutation({
    mutationFn: (payload: { id: string; isRead: boolean }) =>
      studentFetchJson("/api/student/notifications", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
    },
  });

  if (query.isLoading) return <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading notifications...</div>;
  if (query.isError) return <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load notifications.</div>;

  return (
    <div className="space-y-3">
      {query.data?.map((notification) => (
        <article className="glass-card rounded-3xl p-5" key={notification._id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                {notification.isRead ? <MailOpen aria-hidden className="size-4 text-on-surface-variant" /> : <MailWarning aria-hidden className="size-4 text-primary" />}
                <h3 className="font-heading text-xl font-semibold">{notification.title}</h3>
              </div>
              <p className="mt-2 text-sm text-on-surface-variant">{notification.message}</p>
            </div>
            <Button
              onClick={() => mutation.mutate({ id: notification._id, isRead: !notification.isRead })}
              size="sm"
              type="button"
              variant="secondary"
            >
              {notification.isRead ? "Mark unread" : "Mark read"}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
