"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LockKeyhole, UserRoundCog } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { studentFetchJson } from "@/components/student/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StudentProfileResponse } from "@/services/student.service";

type ProfileFormState = {
  name: string;
  email: string;
  avatar: string;
  skillLevel: string;
  preferredSubjects: string;
  learningStyle: string;
  studyGoals: string;
  preferredTime: string;
};

function fromList(values: string[]) {
  return values.join(", ");
}

function toList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function StudentProfilePage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => studentFetchJson<StudentProfileResponse>("/api/student/profile"),
  });

  const [form, setForm] = useState<ProfileFormState>({
    name: "",
    email: "",
    avatar: "",
    skillLevel: "beginner",
    preferredSubjects: "",
    learningStyle: "",
    studyGoals: "",
    preferredTime: "",
  });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    if (!query.data?.user || !query.data?.profile) return;
    setForm({
      name: query.data.user.name,
      email: query.data.user.email,
      avatar: query.data.user.avatar ?? "",
      skillLevel: query.data.profile.skillLevel ?? "beginner",
      preferredSubjects: fromList(query.data.profile.learningPreferences.preferredSubjects ?? []),
      learningStyle: query.data.profile.learningPreferences.learningStyle ?? "",
      studyGoals: fromList(query.data.profile.learningPreferences.studyGoals ?? []),
      preferredTime: query.data.profile.learningPreferences.preferredTime ?? "",
    });
  }, [query.data]);

  const profileMutation = useMutation({
    mutationFn: () =>
      studentFetchJson<StudentProfileResponse>("/api/student/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          avatar: form.avatar,
          skillLevel: form.skillLevel,
          preferredSubjects: toList(form.preferredSubjects),
          learningStyle: form.learningStyle,
          studyGoals: toList(form.studyGoals),
          preferredTime: form.preferredTime,
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      studentFetchJson("/api/student/profile", {
        method: "PUT",
        body: JSON.stringify({
          action: "change-password",
          currentPassword: password.currentPassword,
          newPassword: password.newPassword,
        }),
      }),
    onSuccess: async () => {
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const profile = query.data?.profile;
  const account = query.data?.accountStats;

  return (
    <StudentShell description="Update your personal details, set study preferences, and keep your account secure." title="Profile Management">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-3xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="ai-gradient flex size-11 items-center justify-center rounded-2xl text-white">
              <UserRoundCog aria-hidden className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold">Edit Profile</h2>
              <p className="text-sm text-on-surface-variant">Personal information and learning preferences.</p>
            </div>
          </div>

          {query.isLoading ? (
            <div className="rounded-3xl border border-dashed border-outline-variant/60 bg-white/60 p-6 text-sm text-on-surface-variant">Loading profile...</div>
          ) : query.isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load profile.</div>
          ) : (
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                profileMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input id="avatar" value={form.avatar} onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skillLevel">Skill level</Label>
                <select
                  className="flex h-11 w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
                  id="skillLevel"
                  value={form.skillLevel}
                  onChange={(event) => setForm((current) => ({ ...current, skillLevel: event.target.value }))}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred study time</Label>
                <Input id="preferredTime" value={form.preferredTime} onChange={(event) => setForm((current) => ({ ...current, preferredTime: event.target.value }))} placeholder="Evening, weekends..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="preferredSubjects">Preferred subjects</Label>
                <Input id="preferredSubjects" value={form.preferredSubjects} onChange={(event) => setForm((current) => ({ ...current, preferredSubjects: event.target.value }))} placeholder="Math, Science, English" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="learningStyle">Learning style</Label>
                <Input id="learningStyle" value={form.learningStyle} onChange={(event) => setForm((current) => ({ ...current, learningStyle: event.target.value }))} placeholder="Visual, hands-on, reading..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="studyGoals">Study goals</Label>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-3 text-base outline-none transition-colors placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/30"
                  id="studyGoals"
                  onChange={(event) => setForm((current) => ({ ...current, studyGoals: event.target.value }))}
                  placeholder="Finish Algebra, improve quiz score, prepare for exam"
                  value={form.studyGoals}
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button disabled={profileMutation.isPending} type="submit">
                  {profileMutation.isPending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
                  Save profile
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="ai-gradient flex size-11 items-center justify-center rounded-2xl text-white">
                <LockKeyhole aria-hidden className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-semibold">Change Password</h2>
                <p className="text-sm text-on-surface-variant">Keep your account secure.</p>
              </div>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (password.newPassword !== password.confirmPassword) {
                  return;
                }
                passwordMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input id="currentPassword" type="password" value={password.currentPassword} onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" value={password.newPassword} onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" value={password.confirmPassword} onChange={(event) => setPassword((current) => ({ ...current, confirmPassword: event.target.value }))} />
              </div>

              {password.newPassword && password.confirmPassword && password.newPassword !== password.confirmPassword ? (
                <p className="text-sm text-rose-600">Passwords do not match.</p>
              ) : null}

              <Button className="w-full" disabled={passwordMutation.isPending || !password.currentPassword || !password.newPassword || password.newPassword !== password.confirmPassword} type="submit">
                {passwordMutation.isPending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
                Update password
              </Button>
            </form>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-heading text-2xl font-semibold">Account Stats</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4">
                <p className="text-sm text-on-surface-variant">Enrolled courses</p>
                <p className="mt-2 font-heading text-3xl font-bold text-primary">{account?.enrolledCourses ?? 0}</p>
              </div>
              <div className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4">
                <p className="text-sm text-on-surface-variant">Completed quizzes</p>
                <p className="mt-2 font-heading text-3xl font-bold text-primary">{account?.completedQuizzes ?? 0}</p>
              </div>
              <div className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4">
                <p className="text-sm text-on-surface-variant">Average score</p>
                <p className="mt-2 font-heading text-3xl font-bold text-primary">{account?.averageScore ?? 0}%</p>
              </div>
              <div className="rounded-3xl border border-outline-variant/40 bg-white/70 p-4">
                <p className="text-sm text-on-surface-variant">Certificates</p>
                <p className="mt-2 font-heading text-3xl font-bold text-primary">{account?.certificates ?? 0}</p>
              </div>
            </div>
            {profile ? (
              <div className="mt-4 rounded-3xl border border-outline-variant/40 bg-white/70 p-4 text-sm text-on-surface-variant">
                <p>
                  Skill level: <strong className="text-primary">{profile.skillLevel}</strong>
                </p>
                <p className="mt-2">
                  Learning style: <strong className="text-primary">{profile.learningPreferences.learningStyle || "Not set"}</strong>
                </p>
                <p className="mt-2">
                  Preferred subjects: <strong className="text-primary">{profile.learningPreferences.preferredSubjects.join(", ") || "Not set"}</strong>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </StudentShell>
  );
}
