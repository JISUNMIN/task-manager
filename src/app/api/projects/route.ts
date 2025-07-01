// app/api/projects/route.ts
import { authenticate } from "@/lib/auth";
import { verifyJwt } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { useAuthStore } from "@/store/useAuthStore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const payload = authenticate(req);
    // payload에서 userId, role 추출
    const id = (payload as any).id;
    const role = (payload as any).role;

    let projects;

    if (role === "ADMIN") {
      projects = await prisma.project.findMany({
        include: {
          manager: true,
          tasks: { include: { user: true } },
        },
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { managerId: id },
            {
              tasks: {
                some: { userId: id },
              },
            },
          ],
        },
        include: {
          manager: true,
          tasks: { include: { user: true } },
        },
      });
    }

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
