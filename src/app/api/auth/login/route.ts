// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { userId, password } = await req.json();

    // 1) userId로 유저 조회
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 401 }
      );
    }

    // 2) 비밀번호 비교 (bcrypt)
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    // 토큰 생성
    const token = signJwt({
      id: user.id,
      userId: user.userId,
      role: user.role,
    });

    // HTTPOnly 쿠키에 토큰 담기
    const res = NextResponse.json({
      token,
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60,
      path: "/",
    });
    return res;

    // 3) 성공 시 유저 정보 반환 (비밀번호는 제외)
    // return NextResponse.json({
    //   token,
    //   userId: user.userId,
    //   name: user.name,
    //   role: user.role,
    // });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
