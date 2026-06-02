import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@/types";
import { canRoleAccessPath, getDashboardPathForRole } from "@/lib/auth/permissions";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const role = token?.role as UserRole | undefined;
  const pathname = request.nextUrl.pathname;

  if (!token || !role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!canRoleAccessPath(role, pathname)) {
    return NextResponse.redirect(new URL(getDashboardPathForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
