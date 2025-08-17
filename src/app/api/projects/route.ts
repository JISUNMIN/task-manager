// app/api/projects/route.ts
import { authenticate } from "@/lib/auth";
import { AuthError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
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
        },
        orderBy: [{ isPersonal: "desc" }, { order: "asc" }, { id: "desc" }],
      });
    } else {
      projects = await prisma.project.findMany({
        orderBy: [{ isPersonal: "desc" }, { order: "asc" }, { id: "desc" }],
        where: {
          OR: [
            { managerId: id },
            {
              tasks: {
                some: {
                  assignees: {
                    some: {
                      id: id,
                    },
                  },
                },
              },
            },
          ],
        },
        include: {
          manager: true,
        },
      });
    }

    return NextResponse.json(projects);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: "프로젝트 목록을 불러오는데 오류가 발생했습니다.",
        detail: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { projectName, deadline, managerId } = await req.json();

    if (!projectName || !deadline || !managerId) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    await prisma.project.create({
      data: {
        projectName,
        deadline: new Date(deadline),
        managerId: Number(managerId),
        progress: 0,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "서버 오류로 프로젝트를 생성하지 못했습니다.",
        detail: String(error),
      },
      { status: 500 }
    );
  }
}
