import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { canRoleAccessPath, getDashboardPathForRole } from "@/lib/auth/permissions";
import { getSessionUserFromJwt } from "@/lib/auth/jwt";
import type { UserRole } from "@/types";

export const { auth } = NextAuth({
  providers: [],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }: { auth: { user?: { role?: UserRole } } | null; request: NextRequest }) {
      const pathname = request.nextUrl.pathname;
      const role = auth?.user?.role;

      if (!auth || !role) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
        return NextResponse.redirect(loginUrl);
      }

      if (!canRoleAccessPath(role, pathname)) {
        return NextResponse.redirect(new URL(getDashboardPathForRole(role), request.url));
      }

      return true;
    },
    session({ session, token }) {
      if (session.user) {
        const authUser = getSessionUserFromJwt(token);
        session.user.id = authUser.id;
        session.user.role = authUser.role;
        session.user.approved = authUser.approved;
      }

      return session;
    },
  },
});
