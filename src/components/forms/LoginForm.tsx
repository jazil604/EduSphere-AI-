"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogIn, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { canRoleAccessPath, getDashboardPathForRole } from "@/lib/auth/permissions";

function isSafeCallbackUrl(callbackUrl: string | null): callbackUrl is string {
  return typeof callbackUrl === "string" && callbackUrl.startsWith("/");
}

type LoginFormProps = {
  callbackUrl?: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, role } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  let safeCallbackUrl: string | undefined;
  if (isSafeCallbackUrl(callbackUrl ?? null)) {
    safeCallbackUrl = callbackUrl;
  }

  useEffect(() => {
    if (!isAuthenticated || !role) {
      return;
    }

    const nextPath =
      pendingRedirect && pendingRedirect !== "/login" && !pendingRedirect.startsWith("/signup") && canRoleAccessPath(role, pendingRedirect)
        ? pendingRedirect
        : getDashboardPathForRole(role);

    router.replace(nextPath);
  }, [isAuthenticated, pendingRedirect, role, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(email, password, safeCallbackUrl);

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      setPendingRedirect(safeCallbackUrl ?? null);
    } catch {
      setError("Something went wrong while signing in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail aria-hidden className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-outline" />
          <Input
            autoComplete="email"
            className="pl-10"
            disabled={isSubmitting}
            id="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            type="email"
            value={email}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock aria-hidden className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-outline" />
          <Input
            autoComplete="current-password"
            className="pl-10"
            disabled={isSubmitting}
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            value={password}
          />
        </div>
      </div>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {isLoading ? <p className="text-sm text-on-surface-variant">Checking your session...</p> : null}

      <Button className="w-full" disabled={isSubmitting || isLoading} type="submit">
        {isSubmitting ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <LogIn aria-hidden className="size-4" />}
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Link
          className="rounded-lg border border-outline-variant bg-white/70 px-4 py-3 text-center font-medium"
          href="/signup/student"
        >
          Student signup
        </Link>
        <Link
          className="rounded-lg border border-outline-variant bg-white/70 px-4 py-3 text-center font-medium"
          href="/signup/teacher"
        >
          Teacher signup
        </Link>
      </div>
    </form>
  );
}
