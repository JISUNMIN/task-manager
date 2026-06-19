// auth.ts (토큰 검증 헬퍼 함수)
import { Role } from "@/store/useAuthStore";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { AuthError } from "./error";

export type AuthSession = {
  id: number;
  role: Role;
  userId?: string;
};

function parseToken(token?: string | null): AuthSession | null {
  if (!token) return null;

  const payload = verifyJwt(token);
  if (!payload || typeof payload === "string") return null;

  const parsed = payload as Partial<AuthSession>;
  if (typeof parsed.id !== "number" || !parsed.role) return null;

  return {
    id: parsed.id,
    role: parsed.role,
    userId: parsed.userId,
  };
}

export function authenticate(req: NextRequest): AuthSession {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new AuthError("토큰이 없습니다.");

  const payload = parseToken(token);
  if (!payload) throw new AuthError("유효하지 않은 토큰입니다.");

  return payload;
}

export async function getServerSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return parseToken(token);
}
