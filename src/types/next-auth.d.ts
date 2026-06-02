import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: UserRole;
      approved?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    approved?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    approved?: boolean;
  }
}
