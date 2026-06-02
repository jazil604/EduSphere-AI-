"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Hash, Loader2, ShieldCheck } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function JoinCoursePage() {
  const router = useRouter();
  const [enrollmentCode, setEnrollmentCode] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      studentFetchJson("/api/student/courses/join", {
        method: "POST",
        body: JSON.stringify({ enrollmentCode }),
      }),
    onSuccess: async () => {
      router.push("/student/courses");
      router.refresh();
    },
  });

  return (
    <StudentShell description="Enter the enrollment code shared by your teacher to unlock the course instantly." title="Join a Course">
      <div className="mx-auto grid max-w-3xl gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="glass-card rounded-3xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="ai-gradient flex size-11 items-center justify-center rounded-2xl text-white">
              <Hash aria-hidden className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold">Enrollment Code</h2>
              <p className="text-sm text-on-surface-variant">Teachers usually share this code in class or announcements.</p>
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
              <Label htmlFor="enrollmentCode">Course code</Label>
              <Input id="enrollmentCode" value={enrollmentCode} onChange={(event) => setEnrollmentCode(event.target.value.toUpperCase())} placeholder="ABC123" />
            </div>

            <Button className="w-full" disabled={mutation.isPending || !enrollmentCode.trim()} type="submit">
              {mutation.isPending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
              Join course
            </Button>
          </form>

          {mutation.isError ? <p className="mt-4 text-sm text-rose-600">Failed to join course. Check the code and try again.</p> : null}
        </section>

        <aside className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ShieldCheck aria-hidden className="size-5" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold">What happens next?</h3>
              <p className="text-sm text-on-surface-variant">You’ll be enrolled instantly and can open lessons, quizzes, and assignments right away.</p>
            </div>
          </div>

          <ul className="mt-5 space-y-3 text-sm text-on-surface-variant">
            <li className="rounded-2xl bg-white/70 px-4 py-3">Your progress is tracked as soon as you enter the course.</li>
            <li className="rounded-2xl bg-white/70 px-4 py-3">You can leave the course later from the course card if needed.</li>
            <li className="rounded-2xl bg-white/70 px-4 py-3">Course-specific notifications will appear in your inbox.</li>
          </ul>
        </aside>
      </div>
    </StudentShell>
  );
}
