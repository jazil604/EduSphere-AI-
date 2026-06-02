"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use } from "react";
import { FileUp, Loader2, Upload } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { StudentAssignmentSummary } from "@/services/student.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function SubmitAssignmentPage({ params }: PageProps) {
  const router = useRouter();
  const { id: assignmentId } = use(params);
  const query = useQuery({
    queryKey: ["student-assignments"],
    queryFn: () => studentFetchJson<StudentAssignmentSummary[]>("/api/student/assignments"),
  });
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const assignment = query.data?.find((item) => item._id === assignmentId);

  useEffect(() => {
    setUploadedFiles([]);
  }, [assignmentId]);

  const mutation = useMutation({
    mutationFn: async () => {
      const urls = files.length ? await Promise.all(files.map((file) => uploadToCloudinary(file))) : [];
      setUploadedFiles(urls);
      return studentFetchJson(`/api/student/assignments/${assignmentId}/submit`, {
        method: "POST",
        body: JSON.stringify({
          content,
          attachments: urls,
        }),
      });
    },
    onSuccess: async () => {
      router.push("/student/assignments");
      router.refresh();
    },
  });

  return (
    <StudentShell description="Write your response, upload files to Cloudinary, and submit your work for grading." title="Submit Assignment">
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading assignment...</div>
      ) : query.isError || !assignment ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Assignment not found.</div>
      ) : (
        <div className="mx-auto grid max-w-4xl gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="glass-card rounded-3xl p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="ai-gradient flex size-11 items-center justify-center rounded-2xl text-white">
                <FileUp aria-hidden className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-semibold">{assignment.title}</h2>
                <p className="text-sm text-on-surface-variant">{assignment.courseTitle}</p>
              </div>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                mutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="content">Submission notes</Label>
                <textarea
                  className="min-h-40 w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-3 text-base outline-none transition-colors placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/30"
                  id="content"
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Explain your work, paste your reflection, or provide a short summary."
                  value={content}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Upload files</Label>
                <Input
                  accept="*"
                  id="files"
                  multiple
                  onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                  type="file"
                />
                <p className="text-xs text-on-surface-variant">Files are uploaded to Cloudinary before submission.</p>
              </div>

              {uploadedFiles.length ? (
                <div className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4 text-sm text-on-surface-variant">
                  Uploaded {uploadedFiles.length} file(s) successfully.
                </div>
              ) : null}

              <Button className="w-full" disabled={mutation.isPending} type="submit">
                {mutation.isPending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Upload aria-hidden className="size-4" />}
                Submit assignment
              </Button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="glass-card rounded-3xl p-6">
              <h3 className="font-heading text-xl font-semibold">Assignment Details</h3>
              <p className="mt-2 text-sm text-on-surface-variant">{assignment.description}</p>
              <div className="mt-4 space-y-2 text-sm text-on-surface-variant">
                <p>Due date: {new Date(assignment.dueDate).toLocaleString()}</p>
                <p>Maximum score: {assignment.maxScore}</p>
                <p>Status: {assignment.status}</p>
              </div>
            </div>

            {assignment.attachments.length ? (
              <div className="glass-card rounded-3xl p-6">
                <h3 className="font-heading text-xl font-semibold">Reference Files</h3>
                <div className="mt-3 space-y-2">
                  {assignment.attachments.map((file, index) => (
                    <a
                      className="block rounded-2xl border border-outline-variant/40 bg-white/70 px-4 py-3 text-sm text-on-surface-variant hover:text-primary"
                      href={file}
                      key={`${assignment._id}-file-${index}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open file {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      )}
    </StudentShell>
  );
}
