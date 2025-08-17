// auth.ts (토큰 검증 헬퍼 함수)
import { verifyJwt } from "@/lib/jwt";
import { NextRequest } from "next/server";
import { AuthError } from "./error";

export function authenticate(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new AuthError("토큰이 없습니다.");

  const payload = verifyJwt(token);
  if (!payload || typeof payload === "string")
    throw new AuthError("유효하지 않은 토큰입니다.");

  return payload as { id: number; role: string };
}
