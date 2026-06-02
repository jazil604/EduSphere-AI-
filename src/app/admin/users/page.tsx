import { AdminShell } from "@/components/admin/AdminShell";
import { UserTable } from "@/components/admin/UserTable";

export default function AdminUsersPage() {
  return (
    <AdminShell
      description="Search, filter, approve teachers, block users, and keep the platform roster healthy."
      title="User Management"
    >
      <UserTable />
    </AdminShell>
  );
}

