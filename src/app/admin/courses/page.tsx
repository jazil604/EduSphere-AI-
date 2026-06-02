import { AdminShell } from "@/components/admin/AdminShell";
import { CourseTable } from "@/components/admin/CourseTable";

export default function AdminCoursesPage() {
  return (
    <AdminShell
      description="Inspect course performance, enrollments, and remove content that no longer belongs on the platform."
      title="Course Management"
    >
      <CourseTable />
    </AdminShell>
  );
}

