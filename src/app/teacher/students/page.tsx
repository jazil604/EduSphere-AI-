"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, MessageSquare } from "lucide-react";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { StudentProgressTable, type TeacherStudentRow } from "@/components/teacher/StudentProgressTable";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TeacherStudentsPage() {
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState("");

  const studentsQuery = useQuery({
    queryKey: ["teacher-students"],
    queryFn: () => teacherFetchJson<TeacherStudentRow[]>("/api/teacher/students"),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (payload: { studentName: string; content: string }) =>
      teacherFetchJson("/api/teacher/announcements", {
        method: "POST",
        body: JSON.stringify({
          title: `Message for ${payload.studentName}`,
          content: payload.content,
          targetRoles: ["student"],
          courseId: null,
          expiresAt: null,
        }),
      }),
    onSuccess: async () => {
      setMessage("");
      await queryClient.invalidateQueries({ queryKey: ["teacher-announcements"] });
    },
  });

  const selectedStudent = useMemo(
    () => studentsQuery.data?.find((student) => student._id === studentId) ?? null,
    [studentId, studentsQuery.data],
  );

  return (
    <TeacherShell description="Track student progress, performance, and engagement across your classes." title="Student Management">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <MessageSquare aria-hidden className="size-5 text-primary" />
          <h2 className="font-heading text-2xl font-semibold">Send a message</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_2fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student</Label>
            <select
              id="studentId"
              className="h-11 w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 text-sm outline-none"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
            >
              <option value="">Select a student</option>
              {studentsQuery.data?.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input id="message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type a quick note..." />
          </div>
          <div className="flex items-end">
            <Button
              disabled={!selectedStudent || !message.trim() || sendMessageMutation.isPending}
              onClick={() => {
                if (!selectedStudent) return;
                sendMessageMutation.mutate({ studentName: selectedStudent.name, content: message.trim() });
              }}
              type="button"
            >
              {sendMessageMutation.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}
              Send
            </Button>
          </div>
        </div>
      </div>

      <StudentProgressTable />
    </TeacherShell>
  );
}
