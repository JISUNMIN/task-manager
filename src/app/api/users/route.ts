import { authenticate } from "@/lib/auth";
import { AuthError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    authenticate(req);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        userId: true,
        profileImage: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    return NextResponse.json(users);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("GET /api/users 에러:", error);
    return NextResponse.json(
      { error: "사용자 목록을 불러오는 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
