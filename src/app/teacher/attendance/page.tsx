"use client";

import { TeacherShell } from "@/components/teacher/TeacherShell";
import { AttendanceTable } from "@/components/teacher/AttendanceTable";

export default function TeacherAttendancePage() {
  return (
    <TeacherShell description="Mark attendance, export reports, and inspect student-wise records." title="Attendance Management">
      <AttendanceTable />
    </TeacherShell>
  );
}

