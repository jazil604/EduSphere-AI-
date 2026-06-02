import Link from "next/link";
import { GraduationCap, Sparkles } from "lucide-react";
import { LoginForm } from "@/components/forms/LoginForm";

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const callbackUrl = Array.isArray(resolvedSearchParams.callbackUrl)
    ? resolvedSearchParams.callbackUrl[0]
    : resolvedSearchParams.callbackUrl;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="ai-gradient flex size-11 items-center justify-center rounded-xl text-white">
            <GraduationCap aria-hidden className="size-6" />
          </div>
          <span className="font-heading text-2xl font-bold text-primary">EduSphere AI</span>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <div className="mb-8 space-y-2">
            <p className="flex items-center gap-2 font-mono text-sm text-secondary">
              <Sparkles aria-hidden className="size-4" />
              AI learning portal
            </p>
            <h1 className="font-heading text-3xl font-bold">Welcome back</h1>
            <p className="text-on-surface-variant">Continue your personalized learning journey.</p>
          </div>

          <LoginForm callbackUrl={callbackUrl} />

          <div className="mt-6 text-center text-sm text-on-surface-variant">
            New here?{" "}
            <Link className="font-semibold text-primary" href="/signup/student">
              Create a student account
            </Link>
            {" or "}
            <Link className="font-semibold text-primary" href="/signup/teacher">
              create a teacher account
            </Link>
            .
          </div>
        </div>
      </section>
    </main>
  );
}
