"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Save } from "lucide-react";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TeacherCourseCardData } from "@/components/teacher/CourseCard";
import { useParams } from "next/navigation";

export default function TeacherCourseDetailPage() {
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    setCourseId(params.id);
  }, [params.id]);

  const query = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: () => teacherFetchJson<TeacherCourseCardData[]>("/api/teacher/courses"),
    enabled: Boolean(courseId),
  });

  useEffect(() => {
    const course = query.data?.find((item) => item._id === courseId);
    if (!course) return;
    setTitle(course.title);
    setDescription(course.description);
    setSubject(course.subject);
    setThumbnail(course.thumbnail);
    setIsPublished(course.isPublished);
  }, [courseId, query.data]);

  const mutation = useMutation({
    mutationFn: () =>
      teacherFetchJson(`/api/teacher/courses/${courseId}`, {
        method: "PUT",
        body: JSON.stringify({ title, description, subject, thumbnail, isPublished }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
    },
  });

  return (
    <TeacherShell description="Edit course details, publication state, and resources." title="Edit Course">
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading course...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load course.</div>
      ) : (
        <form
          className="glass-card space-y-5 rounded-3xl p-6"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="min-h-[160px] w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input id="thumbnail" value={thumbnail} onChange={(event) => setThumbnail(event.target.value)} />
          </div>
          <label className="flex items-center gap-3 text-sm text-on-surface-variant">
            <input checked={isPublished} type="checkbox" onChange={(event) => setIsPublished(event.target.checked)} />
            Published
          </label>
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Save aria-hidden className="size-4" />}
            Save changes
          </Button>
        </form>
      )}
    </TeacherShell>
  );
}
