"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, LoaderCircle, Lock, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardPathForRole } from "@/lib/auth/permissions";

export function TeacherSignupForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subjectSpecialization, setSubjectSpecialization] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "teacher",
          subjectSpecialization,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to create teacher account.");
        return;
      }

      const loginResult = await login(email, password);
      if (loginResult?.error) {
        router.replace("/login");
        return;
      }

      router.replace(getDashboardPathForRole("teacher"));
    } catch {
      setError("Something went wrong while creating your account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          autoComplete="name"
          disabled={isSubmitting}
          id="name"
          name="name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          value={name}
        />
      </div>
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
            autoComplete="new-password"
            className="pl-10"
            disabled={isSubmitting}
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            type="password"
            value={password}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subjectSpecialization">Subject specialization</Label>
        <div className="relative">
          <BookOpen aria-hidden className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-outline" />
          <Input
            className="pl-10"
            disabled={isSubmitting}
            id="subjectSpecialization"
            name="subjectSpecialization"
            onChange={(event) => setSubjectSpecialization(event.target.value)}
            placeholder="Example: Mathematics, Physics"
            value={subjectSpecialization}
          />
        </div>
      </div>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <UserPlus aria-hidden className="size-4" />}
        {isSubmitting ? "Creating account..." : "Create teacher account"}
      </Button>
    </form>
  );
}
