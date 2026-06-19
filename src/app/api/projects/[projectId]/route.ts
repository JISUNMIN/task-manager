// app/api/projects/[projectId]/route.ts
// 특정 projectId로 조회
import { authenticate } from "@/lib/auth";
import { AuthError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const projectDetailInclude = {
  manager: {
    select: {
      id: true,
      userId: true,
      name: true,
      role: true,
      profileImage: true,
    },
  },
  tasks: {
    include: {
      assignees: {
        select: {
          id: true,
          userId: true,
          name: true,
          profileImage: true,
        },
      },
    },
    orderBy: { order: "asc" as const },
  },
} as const;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { id, role } = authenticate(req);
    const { projectId } = await context.params;
    const numericProjectId = Number(projectId);

    const project = await prisma.project.findUnique({
      include: projectDetailInclude,
      where: { id: numericProjectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const canAccess =
      role === "ADMIN" ||
      project.managerId === id ||
      project.tasks.some((task) => task.assignees.some((assignee) => assignee.id === id));

    if (!canAccess) {
      return NextResponse.json({ error: "조회 권한이 없습니다." }, { status: 403 });
    }

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const payload = authenticate(req);
    const { id: userId, role } = payload;

    const { projectId } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) },
    });

    if (!project) {
      return NextResponse.json(
        { error: "프로젝트가 없습니다." },
        { status: 404 }
      );
    }

    if (role !== "ADMIN" && project.managerId !== userId) {
      return NextResponse.json(
        { error: "삭제 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 삭제 수행
    await prisma.project.delete({ where: { id: Number(projectId) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        detail: String(error),
      },
      { status: 500 }
    );
  }
}
