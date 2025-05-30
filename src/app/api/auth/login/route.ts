// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // 더미 유저 예시
  if (email === "test@example.com" && password === "password") {
    return NextResponse.json({
      token: "mock-jwt-token",
      user: { id: 1, name: "Tester" },
    });
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
