"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type GradeModalProps = {
  assignmentId: string;
  submissionId: string;
  onClose: () => void;
};

export function GradeModal({ assignmentId, submissionId, onClose }: GradeModalProps) {
  const queryClient = useQueryClient();
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      teacherFetchJson(`/api/teacher/assignments/${assignmentId}/grade`, {
        method: "POST",
        body: JSON.stringify({ assignmentId, submissionId, score, feedback }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
      await queryClient.invalidateQueries({ queryKey: ["teacher-assignment-submissions", assignmentId] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="glass-card w-full max-w-lg rounded-3xl p-6">
        <h3 className="font-heading text-2xl font-semibold">Grade submission</h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gradeScore">Score</Label>
            <Input id="gradeScore" type="number" value={score} onChange={(event) => setScore(Number(event.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradeFeedback">Feedback</Label>
            <textarea
              id="gradeFeedback"
              className="min-h-[120px] w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none"
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button disabled={mutation.isPending} onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate()} type="button">
            {mutation.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}
            Save grade
          </Button>
        </div>
      </div>
    </div>
  );
}
