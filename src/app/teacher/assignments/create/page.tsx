"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TeacherCourseCardData } from "@/components/teacher/CourseCard";
import { useRouter } from "next/navigation";

export default function TeacherCreateAssignmentPage() {
  const router = useRouter();
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachments, setAttachments] = useState("");

  const coursesQuery = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: () => teacherFetchJson<TeacherCourseCardData[]>("/api/teacher/courses"),
  });

  const mutation = useMutation({
    mutationFn: () =>
      teacherFetchJson("/api/teacher/assignments", {
        method: "POST",
        body: JSON.stringify({
          courseId,
          title,
          description,
          dueDate,
          attachments: attachments.split("\n").map((item) => item.trim()).filter(Boolean),
        }),
      }),
    onSuccess: async () => router.replace("/teacher/assignments"),
  });

  return (
    <TeacherShell description="Create a graded assignment and set the due date." title="Create Assignment">
      <form
        className="glass-card space-y-5 rounded-3xl p-6"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="courseId">Course</Label>
          <select className="h-11 w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 text-sm outline-none" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            <option value="">Select a course</option>
            {coursesQuery.data?.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea className="min-h-[160px] w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none" value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attachments">Attachments URLs</Label>
          <textarea className="min-h-[120px] w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none" value={attachments} onChange={(event) => setAttachments(event.target.value)} placeholder="One URL per line" />
        </div>
        <Button disabled={mutation.isPending} type="submit">
          <Save aria-hidden className="size-4" />
          Save assignment
        </Button>
      </form>
    </TeacherShell>
  );
}
