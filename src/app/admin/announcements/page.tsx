"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { adminFetchJson } from "@/components/admin/api";
import { Button } from "@/components/ui/button";
import type { AnnouncementItem } from "@/services/admin.service";
import { useState } from "react";

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);

  const query = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: () => adminFetchJson<AnnouncementItem[]>("/api/admin/announcements"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetchJson("/api/admin/announcements", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-activity"] });
    },
  });

  return (
    <AdminShell
      description="Publish platform updates, target specific groups, and keep the community informed."
      title="Announcements"
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AnnouncementForm
          announcement={editingAnnouncement}
          onCancel={editingAnnouncement ? () => setEditingAnnouncement(null) : undefined}
          onSaved={() => setEditingAnnouncement(null)}
        />

        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-heading text-2xl font-semibold">Published Announcements</h2>
            <p className="text-sm text-on-surface-variant">Edit, disable, or remove messages whenever they need a refresh.</p>
          </div>

          {query.isLoading ? (
            <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading announcements...</div>
          ) : query.isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              Failed to load announcements.
            </div>
          ) : (
            <div className="space-y-4">
              {query.data?.map((announcement) => (
                <article className="glass-card rounded-3xl p-5" key={announcement._id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading text-2xl font-semibold">{announcement.title}</h3>
                      <p className="mt-2 text-sm text-on-surface-variant">{announcement.content}</p>
                    </div>
                    <span
                      className={
                        announcement.isActive
                          ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700"
                      }
                    >
                      {announcement.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                    <span className="rounded-full bg-white/70 px-3 py-1">Target: {announcement.targetRoles.join(", ")}</span>
                    {announcement.expiresAt ? (
                      <span className="rounded-full bg-white/70 px-3 py-1">
                        Expires: {new Date(announcement.expiresAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      onClick={() => setEditingAnnouncement(announcement)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      Edit
                    </Button>
                    <Button
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Delete "${announcement.title}"?`)) {
                          deleteMutation.mutate(announcement._id);
                        }
                      }}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <Trash2 aria-hidden className="size-4" />
                      Delete
                    </Button>
                  </div>

                  {deleteMutation.isError ? (
                    <p className="mt-3 flex items-center gap-2 text-sm text-red-700">
                      <AlertTriangle aria-hidden className="size-4" />
                      Failed to delete announcement.
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

