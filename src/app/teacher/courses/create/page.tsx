"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Save, Upload } from "lucide-react";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { teacherFetchJson } from "@/components/teacher/api";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function TeacherCreateCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [uploadError, setUploadError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      teacherFetchJson("/api/teacher/courses", {
        method: "POST",
        body: JSON.stringify({ title, description, subject, thumbnail }),
      }),
    onSuccess: async (course) => {
      router.replace("/teacher/courses");
      return course;
    },
  });

  return (
    <TeacherShell
      description="Create a new course with title, description, subject, and a Cloudinary thumbnail."
      title="Create Course"
    >
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
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail URL</Label>
          <Input id="thumbnail" value={thumbnail} onChange={(event) => setThumbnail(event.target.value)} placeholder="Cloudinary URL" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumbnailFile">Upload thumbnail</Label>
          <Input
            id="thumbnailFile"
            type="file"
            accept="image/*"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setUploadError("");
              try {
                const url = await uploadToCloudinary(file);
                setThumbnail(url);
              } catch (error) {
                setUploadError(error instanceof Error ? error.message : "Upload failed.");
              }
            }}
          />
          {uploadError ? <p className="text-sm text-red-700">{uploadError}</p> : null}
        </div>
        <div className="flex gap-3">
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? <Save aria-hidden className="size-4 animate-pulse" /> : null}
            Save course
          </Button>
          <Button asChild variant="secondary">
            <a href="/teacher/courses">
              <Upload aria-hidden className="size-4" />
              Cancel
            </a>
          </Button>
        </div>
      </form>
    </TeacherShell>
  );
}

