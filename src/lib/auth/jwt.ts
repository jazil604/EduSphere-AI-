import type { JWT } from "next-auth/jwt";
import type { UserRole } from "@/types";

export type AuthUserClaims = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
  approved?: boolean;
};

export function buildJwtClaims(user: AuthUserClaims) {
  return {
    sub: user.id,
    name: user.name ?? undefined,
    email: user.email ?? undefined,
    role: user.role,
    approved: user.approved ?? true,
  } satisfies Partial<JWT>;
}

export function getSessionUserFromJwt(token: JWT) {
  return {
    id: token.sub ?? "",
    role: token.role as UserRole | undefined,
    approved: token.approved as boolean | undefined,
  };
}

