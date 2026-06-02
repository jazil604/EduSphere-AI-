import type { UserRole } from "@/types";

export const ROLE_HOME_PATHS = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
} as const satisfies Record<UserRole, string>;

export function getDashboardPathForRole(role: UserRole) {
  return ROLE_HOME_PATHS[role];
}

export function getRoleFromPathname(pathname: string): UserRole | null {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (pathname === "/teacher" || pathname.startsWith("/teacher/")) return "teacher";
  if (pathname === "/student" || pathname.startsWith("/student/")) return "student";
  return null;
}

export function canRoleAccessPath(role: UserRole, pathname: string) {
  const requiredRole = getRoleFromPathname(pathname);
  return requiredRole === null || requiredRole === role;
}

