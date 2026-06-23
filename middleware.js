import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { canRoleAccessPath, getDashboardPathForRole } from "./src/lib/auth/permissions";

export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;
  const role = token?.role;

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
  matcher: ["/admin", "/admin/:path*", "/teacher", "/teacher/:path*", "/student", "/student/:path*"],
};
