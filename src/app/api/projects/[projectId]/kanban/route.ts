// app/api/projects/[projectId]/kanban/route.ts
// 특정 projectId로 조회
import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const project = await prisma.project.findUnique({
      include: {
        manager: true,
        tasks: true,
      },
      where: { id: Number(projectId) },
    });

    if (!project) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const payload = authenticate(req);
    const userId = (payload as any).id;
    const role = (payload as any).role;

    const { projectId } = await params;

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
