// app/api/projects/[projectId]/label/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const { label } = await req.json();

    const updatedTask = await prisma.project.update({
      where: { id: Number(projectId) },
      data: { label },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json(
      { error: "라벨 변경 실패", detail: String(error) },
      { status: 500 }
    );
  }
}
