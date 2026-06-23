import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/lib/db/models/User";
import type { UserRole } from "@/types";
import { buildJwtClaims, getSessionUserFromJwt } from "@/lib/auth/jwt";
import { canRoleAccessPath, getDashboardPathForRole } from "@/lib/auth/permissions";

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        await connectToDatabase();
        const user = await UserModel.findOne({ email });

        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          approved: user.approved,
        };
      },
    }),
  ],
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
    async jwt({ token, user }) {
      if (user) {
        Object.assign(
          token,
          buildJwtClaims(user as { id: string; name?: string | null; email?: string | null; role: UserRole; approved?: boolean }),
        );
        return token;
      }

      if (token.sub && !token.role) {
        await connectToDatabase();
        const dbUser = (await UserModel.findById(token.sub).select("role").lean()) as { role?: UserRole } | null;
        if (dbUser) {
          token.role = dbUser.role as UserRole;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const authUser = getSessionUserFromJwt(token);
        session.user.id = authUser.id;
        session.user.role = authUser.role ?? session.user.role;
        session.user.approved = authUser.approved ?? session.user.approved;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      const resolvedUrl = new URL(url, baseUrl);

      if (resolvedUrl.origin !== baseUrl) {
        return baseUrl;
      }

      if (resolvedUrl.pathname === "/login" || resolvedUrl.pathname.startsWith("/signup")) {
        return baseUrl;
      }

      return resolvedUrl.toString();
    },
  },
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
