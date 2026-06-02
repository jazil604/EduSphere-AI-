"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Upload } from "lucide-react";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { teacherFetchJson } from "@/components/teacher/api";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function TeacherAddLessonPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lessonId");
  const courseId = params.id;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState(30);
  const [lessonOrder, setLessonOrder] = useState(1);
  const [uploadError, setUploadError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      teacherFetchJson(`/api/teacher/courses/${courseId}/lessons`, {
        method: lessonId ? "PUT" : "POST",
        body: JSON.stringify({
          id: lessonId,
          title,
          content,
          videoUrl,
          notes: notes.split("\n").map((item) => item.trim()).filter(Boolean),
          duration,
          order: lessonOrder,
        }),
      }),
    onSuccess: async () => {
      router.replace(`/teacher/courses/${courseId}/lessons`);
    },
  });

  return (
    <TeacherShell description="Add lesson content, Cloudinary media, and PDF notes." title={lessonId ? "Edit Lesson" : "Add Lesson"}>
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
            <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input id="duration" type="number" value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            className="min-h-[180px] w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="videoUrl">YouTube or Cloudinary video URL</Label>
          <Input id="videoUrl" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="videoFile">Upload video</Label>
          <Input
            id="videoFile"
            type="file"
            accept="video/*"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setUploadError("");
              try {
                const url = await uploadToCloudinary(file);
                setVideoUrl(url);
              } catch (error) {
                setUploadError(error instanceof Error ? error.message : "Upload failed.");
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">PDF notes / resources URLs</Label>
          <textarea
            id="notes"
            className="min-h-[140px] w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="One URL per line"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input id="order" type="number" value={lessonOrder} onChange={(event) => setLessonOrder(Number(event.target.value))} />
          </div>
        </div>
        {uploadError ? <p className="text-sm text-red-700">{uploadError}</p> : null}
        <div className="flex gap-3">
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}
            Save lesson
          </Button>
          <Button asChild variant="secondary">
            <a href={`/teacher/courses/${courseId}/lessons`}>
              <Upload aria-hidden className="size-4" />
              Cancel
            </a>
          </Button>
        </div>
      </form>
    </TeacherShell>
  );
}

