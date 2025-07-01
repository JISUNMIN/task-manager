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

export async function POST(req: NextRequest) {
  try {
    const { projectName, deadline, managerId } = await req.json();

    // if (!projectName || !deadline || !managerId) {
    if (!projectName || !deadline) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    await prisma.project.create({
      data: {
        projectName,
        deadline: new Date(deadline),
        managerId: managerId ?? 1,
        progress: 0,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류로 프로젝트를 생성하지 못했습니다." },
      { status: 500 }
    );
  }
}
