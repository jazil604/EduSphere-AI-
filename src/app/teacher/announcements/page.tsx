"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, PencilLine, Plus, Trash2 } from "lucide-react";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TeacherCourseCardData } from "@/components/teacher/CourseCard";
import type { UserRole } from "@/types";

type TeacherAnnouncement = {
  _id: string;
  title: string;
  content: string;
  targetRoles: UserRole[];
  courseId: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function deriveTargetRole(targetRoles: UserRole[]) {
  if (targetRoles.includes("student") && targetRoles.includes("teacher")) {
    return "all" as const;
  }
  if (targetRoles.includes("teacher")) {
    return "teacher" as const;
  }
  return "student" as const;
}

const targetRoleOptions: Array<{ label: string; value: "all" | "student" | "teacher" }> = [
  { label: "All", value: "all" },
  { label: "Students", value: "student" },
  { label: "Teachers", value: "teacher" },
];

export default function TeacherAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState("");
  const [targetRole, setTargetRole] = useState<"all" | "student" | "teacher">("student");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const announcementsQuery = useQuery({
    queryKey: ["teacher-announcements"],
    queryFn: () => teacherFetchJson<TeacherAnnouncement[]>("/api/teacher/announcements"),
  });

  const coursesQuery = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: () => teacherFetchJson<TeacherCourseCardData[]>("/api/teacher/courses"),
  });

  const createMutation = useMutation({
    mutationFn: (payload: {
      title: string;
      content: string;
      courseId: string | null;
      targetRoles: UserRole[];
      expiresAt: string | null;
    }) =>
      teacherFetchJson("/api/teacher/announcements", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teacher-announcements"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      title: string;
      content: string;
      courseId: string | null;
      targetRoles: UserRole[];
      expiresAt: string | null;
      isActive: boolean;
    }) =>
      teacherFetchJson("/api/teacher/announcements", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teacher-announcements"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      teacherFetchJson(`/api/teacher/announcements?id=${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teacher-announcements"] });
    },
  });

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setCourseId("");
    setTargetRole("student");
    setExpiresAt("");
    setIsActive(true);
  }

  function startEdit(announcement: TeacherAnnouncement) {
    setEditingId(announcement._id);
    setTitle(announcement.title);
    setContent(announcement.content);
    setCourseId(announcement.courseId ?? "");
    setTargetRole(deriveTargetRole(announcement.targetRoles));
    setExpiresAt(announcement.expiresAt ? announcement.expiresAt.slice(0, 16) : "");
    setIsActive(announcement.isActive);
  }

  const submitDisabled = useMemo(() => createMutation.isPending || updateMutation.isPending, [createMutation.isPending, updateMutation.isPending]);
  const targetRoles = targetRole === "all" ? (["student", "teacher"] as UserRole[]) : ([targetRole] as UserRole[]);

  return (
    <TeacherShell description="Post course-specific announcements and keep a visible history." title="Announcements">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          className="glass-card space-y-5 rounded-3xl p-6"
          onSubmit={(event) => {
            event.preventDefault();
            const payload = {
              title: title.trim(),
              content: content.trim(),
              courseId: courseId || null,
              targetRoles,
              expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
            };
            if (editingId) {
              updateMutation.mutate({ id: editingId, ...payload, isActive });
              return;
            }
            createMutation.mutate(payload);
          }}
        >
          <div className="flex items-center gap-3">
            <Plus aria-hidden className="size-5 text-primary" />
            <h2 className="font-heading text-2xl font-semibold">{editingId ? "Edit announcement" : "Create announcement"}</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcementTitle">Title</Label>
              <Input id="announcementTitle" value={title} onChange={(event) => setTitle(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcementContent">Content</Label>
              <textarea
                id="announcementContent"
                className="min-h-[160px] w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseId">Course</Label>
              <select
                id="courseId"
                className="h-11 w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 text-sm outline-none"
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
              >
                <option value="">All courses</option>
                {coursesQuery.data?.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="targetRole">Target audience</Label>
                <select
                  id="targetRole"
                  className="h-11 w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 text-sm outline-none"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value as "all" | "student" | "teacher")}
                >
                  {targetRoleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry date</Label>
                <Input id="expiresAt" type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm text-on-surface-variant">
              <input checked={isActive} onChange={(event) => setIsActive(event.target.checked)} type="checkbox" />
              Active announcement
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button disabled={submitDisabled} type="submit">
              {submitDisabled ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}
              {editingId ? "Update" : "Publish"}
            </Button>
            {editingId ? (
              <Button onClick={resetForm} type="button" variant="secondary">
                Cancel edit
              </Button>
            ) : null}
          </div>
        </form>

        <div className="space-y-4">
          {announcementsQuery.isLoading ? (
            <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading announcements...</div>
          ) : announcementsQuery.isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load announcements.</div>
          ) : (
            announcementsQuery.data?.map((announcement) => (
              <article className="glass-card rounded-3xl p-5" key={announcement._id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-heading text-xl font-semibold">{announcement.title}</h3>
                    <p className="mt-2 text-sm text-on-surface-variant">{announcement.content}</p>
                    <p className="mt-2 text-xs text-on-surface-variant">
                      {announcement.courseId ? `Course: ${announcement.courseId}` : "All courses"} ·{" "}
                      {announcement.targetRoles.join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => startEdit(announcement)} size="sm" type="button" variant="secondary">
                      <PencilLine aria-hidden className="size-4" />
                    </Button>
                    <Button
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Delete announcement "${announcement.title}"?`)) {
                          deleteMutation.mutate(announcement._id);
                        }
                      }}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </TeacherShell>
  );
}
