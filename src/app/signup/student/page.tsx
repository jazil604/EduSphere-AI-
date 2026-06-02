import Link from "next/link";
import { GraduationCap, Sparkles } from "lucide-react";
import { StudentSignupForm } from "@/components/forms/StudentSignupForm";

export default function StudentSignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="ai-gradient flex size-11 items-center justify-center rounded-xl text-white">
            <GraduationCap aria-hidden className="size-6" />
          </div>
          <span className="font-heading text-2xl font-bold text-primary">Student signup</span>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <div className="mb-8 space-y-2">
            <p className="flex items-center gap-2 font-mono text-sm text-secondary">
              <Sparkles aria-hidden className="size-4" />
              Start learning with AI support
            </p>
            <h1 className="font-heading text-3xl font-bold">Create your student account</h1>
            <p className="text-on-surface-variant">Join courses, track progress, and learn at your own pace.</p>
          </div>

          <StudentSignupForm />

          <div className="mt-6 text-center text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link className="font-semibold text-primary" href="/login">
              Sign in
            </Link>
            .
          </div>
        </div>
      </section>
    </main>
  );
}

