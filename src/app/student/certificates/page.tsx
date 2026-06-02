"use client";

import { useQuery } from "@tanstack/react-query";
import { CertificateCard } from "@/components/student/CertificateCard";
import { StudentShell } from "@/components/student/StudentShell";
import { studentFetchJson } from "@/components/student/api";
import type { StudentCertificateItem } from "@/services/student.service";

export default function StudentCertificatesPage() {
  const query = useQuery({
    queryKey: ["student-certificates"],
    queryFn: () => studentFetchJson<StudentCertificateItem[]>("/api/student/certificates"),
  });

  return (
    <StudentShell description="View and share your earned certificates as you complete courses and meet the mastery threshold." title="Certificates">
      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading certificates...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load certificates.</div>
      ) : query.data?.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {query.data.map((certificate) => (
            <CertificateCard certificate={certificate} key={certificate._id} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">No certificates earned yet. Complete courses and quizzes to unlock them.</div>
      )}
    </StudentShell>
  );
}
