"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import type { UserRole } from "@/types";
import { getDashboardPathForRole } from "@/lib/auth/permissions";

function isInternalPath(pathname: string | null | undefined) {
  return typeof pathname === "string" && pathname.startsWith("/");
}

export function useAuth() {
  const session = useSession();
  const role = session.data?.user?.role ?? null;

  async function login(email: string, password: string, callbackUrl?: string) {
    const safeCallbackUrl = isInternalPath(callbackUrl) ? callbackUrl : undefined;

    return signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: safeCallbackUrl,
    });
  }

  async function logout(callbackUrl = "/login") {
    return signOut({ callbackUrl });
  }

  function getHomePath(nextRole: UserRole | null = role) {
    if (!nextRole) {
      return "/login";
    }

    return getDashboardPathForRole(nextRole);
  }

  return {
    ...session,
    user: session.data?.user ?? null,
    role,
    isAdmin: role === "admin",
    isTeacher: role === "teacher",
    isStudent: role === "student",
    isAuthenticated: session.status === "authenticated",
    isLoading: session.status === "loading",
    login,
    logout,
    getHomePath,
  };
}
