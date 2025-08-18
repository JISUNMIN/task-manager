// app/api/projects/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const { projectIds }: { projectIds: number[] } = await req.json();

    if (projectIds.length === 0) {
      return NextResponse.json(
        { message: "변경할 프로젝트가 없습니다." },
        { status: 200 }
      );
    }

    // 1. 현재 프로젝트 순서 가져오기
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      orderBy: { order: "asc" },
    });

    // 2. 순차적으로 Float order 계산 & 업데이트
    for (let i = 0; i < projectIds.length; i++) {
      const id = projectIds[i];

      // 이전 order
      const prevOrder = i === 0 ? 0 : projects[i - 1]?.order ?? i;

      // 다음 order (없으면 prev + 1)
      const nextOrder =
        i + 1 < projects.length ? projects[i + 1]?.order ?? prevOrder + 1 : prevOrder + 1;

      const newOrder = (prevOrder + nextOrder) / 2;

      await prisma.project.update({
        where: { id },
        data: { order: newOrder },
      });
    }

    return NextResponse.json({ message: "순서 변경 성공" });
  } catch (error) {
    return NextResponse.json(
      { error: "순서 변경 실패", detail: String(error) },
      { status: 500 }
    );
  }
}
