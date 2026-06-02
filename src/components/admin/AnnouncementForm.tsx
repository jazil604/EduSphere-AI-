"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BellRing, LoaderCircle, Save } from "lucide-react";
import { adminFetchJson } from "@/components/admin/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AnnouncementItem } from "@/services/admin.service";

type AnnouncementAudience = "all" | "students" | "teachers";

type AnnouncementFormProps = {
  announcement?: AnnouncementItem | null;
  onSaved?: () => void;
  onCancel?: () => void;
};

function deriveAudience(targetRoles: string[]) {
  if (targetRoles.length === 3) return "all";
  if (targetRoles.length === 1 && targetRoles.includes("student")) return "students";
  if (targetRoles.length === 1 && targetRoles.includes("teacher")) return "teachers";
  return "all";
}

function toTargetRoles(audience: AnnouncementAudience) {
  if (audience === "students") return ["student"];
  if (audience === "teachers") return ["teacher"];
  return ["admin", "teacher", "student"];
}

export function AnnouncementForm({ announcement, onSaved, onCancel }: AnnouncementFormProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>("all");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!announcement) {
      setTitle("");
      setContent("");
      setAudience("all");
      setExpiresAt("");
      setIsActive(true);
      return;
    }

    setTitle(announcement.title);
    setContent(announcement.content);
    setAudience(deriveAudience(announcement.targetRoles));
    setExpiresAt(announcement.expiresAt ? announcement.expiresAt.slice(0, 16) : "");
    setIsActive(announcement.isActive);
  }, [announcement]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        content,
        targetRoles: toTargetRoles(audience),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        isActive,
      };

      if (announcement) {
        return adminFetchJson("/api/admin/announcements", {
          method: "PUT",
          body: JSON.stringify({ id: announcement._id, ...payload }),
        });
      }

      return adminFetchJson("/api/admin/announcements", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-activity"] });
      onSaved?.();
    },
  });

  return (
    <form
      className="glass-card rounded-3xl p-6"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="flex items-center gap-3">
        <div className="ai-gradient flex size-10 items-center justify-center rounded-2xl text-white">
          <BellRing aria-hidden className="size-4" />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-semibold">{announcement ? "Edit announcement" : "Create announcement"}</h2>
          <p className="text-sm text-on-surface-variant">Target updates to learners, teachers, or the whole platform.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Announcement title" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <textarea
            className="min-h-[140px] w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write the message here..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="audience">Target roles</Label>
            <select
              className="h-11 w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 text-sm outline-none"
              id="audience"
              value={audience}
              onChange={(event) => setAudience(event.target.value as AnnouncementAudience)}
            >
              <option value="all">All</option>
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiry date</Label>
            <Input id="expiresAt" type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
          </div>
        </div>

        {announcement ? (
          <label className="flex items-center gap-3 text-sm text-on-surface-variant">
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            Active
          </label>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Save aria-hidden className="size-4" />}
          {announcement ? "Update" : "Publish"}
        </Button>
        {announcement && onCancel ? (
          <Button disabled={mutation.isPending} onClick={onCancel} type="button" variant="secondary">
            Cancel
          </Button>
        ) : null}
      </div>

      {mutation.isError ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to save announcement.
        </p>
      ) : null}
    </form>
  );
}

