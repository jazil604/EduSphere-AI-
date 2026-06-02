"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Save, ShieldCheck, UserCircle2 } from "lucide-react";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TeacherProfileResponse } from "@/services/teacher.service";

export default function TeacherProfilePage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["teacher-profile"],
    queryFn: () => teacherFetchJson<TeacherProfileResponse>("/api/teacher/profile"),
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!query.data) return;
    setName(query.data.user?.name ?? "");
    setEmail(query.data.user?.email ?? "");
    setDepartment(query.data.profile?.department ?? "");
    setBio(query.data.profile?.bio ?? "");
    setQualifications((query.data.profile?.qualifications ?? []).join(", "));
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      teacherFetchJson("/api/teacher/profile", {
        method: "PUT",
        body: JSON.stringify({
          name,
          email,
          department,
          bio,
          qualifications: qualifications
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teacher-profile"] });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      teacherFetchJson("/api/teacher/profile", {
        method: "PUT",
        body: JSON.stringify({
          action: "change-password",
          currentPassword,
          newPassword,
        }),
      }),
    onSuccess: async () => {
      setCurrentPassword("");
      setNewPassword("");
    },
  });

  return (
    <TeacherShell
      description="Keep your academic profile, department, qualifications, and password up to date."
      title="Profile Management"
    >
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading profile...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load profile.</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <form
            className="glass-card space-y-5 rounded-3xl p-6"
            onSubmit={(event) => {
              event.preventDefault();
              saveMutation.mutate();
            }}
          >
            <div className="flex items-center gap-3">
              <UserCircle2 aria-hidden className="size-6 text-primary" />
              <h2 className="font-heading text-2xl font-semibold">Edit profile</h2>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={(event) => setDepartment(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="min-h-[120px] w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Input
                  id="qualifications"
                  value={qualifications}
                  onChange={(event) => setQualifications(event.target.value)}
                  placeholder="Comma separated"
                />
              </div>
            </div>
            <Button disabled={saveMutation.isPending} type="submit">
              {saveMutation.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Save aria-hidden className="size-4" />}
              Save changes
            </Button>
          </form>

          <form
            className="glass-card space-y-5 rounded-3xl p-6"
            onSubmit={(event) => {
              event.preventDefault();
              passwordMutation.mutate();
            }}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck aria-hidden className="size-6 text-primary" />
              <h2 className="font-heading text-2xl font-semibold">Change password</h2>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>
            <Button disabled={passwordMutation.isPending} type="submit" variant="secondary">
              {passwordMutation.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}
              Update password
            </Button>
          </form>
        </div>
      )}
    </TeacherShell>
  );
}

