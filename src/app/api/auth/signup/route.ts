// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { CreateParams } from "@/hooks/react-query/useSignup";

export async function POST(req: NextRequest) {
  try {
    const { userId, password, name } = (await req.json()) as CreateParams;

    // 필수값 확인
    if (!userId || !password || !name) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다." },
        { status: 400 }
      );
    }

    // 1) userId로 유저 조회
    const existUser = await prisma.user.findUnique({
      where: { userId },
    });

    if (existUser) {
      return NextResponse.json(
        { error: "이미 사용중인 아이디입니다." },
        { status: 409 } // 409 Conflict
      );
    }

    // 2) 비밀번호 해싱
    const hashed = await bcrypt.hash(password, 10);

    // 3) 사용자 생성
    const user = await prisma.user.create({
      data: {
        userId,
        password: hashed,
        name,
      },
    });

    // 4) 개인 프로젝트 생성
    await prisma.project.create({
      data: {
        projectName: `${name}의 개인 프로젝트`,
        progress: 0,
        managerId: user.id,
        isPersonal: true,
      },
    });

    // 5) 성공 응답
    return NextResponse.json(
      { userId: user.userId, name: user.name },
      { status: 201 }
    );
  } catch (error) {
    console.error("회원가입 에러:", error);
    return NextResponse.json(
      { error: "서버 오류로 회원가입에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
