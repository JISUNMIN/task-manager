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

    const updatePromises = projectIds.map((id, index) =>
      prisma.project.update({
        where: { id },
        data: { order: index },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ message: "순서 변경 성공" });
  } catch (error) {
    return NextResponse.json(
      { error: "순서 변경 실패", detail: String(error) },
      { status: 500 }
    );
  }
}
