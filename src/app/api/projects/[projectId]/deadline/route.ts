// app/api/projects/[projectId]/deadline/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { deadline } = await req.json();

    const updatedTask = await prisma.project.update({
      where: { id: Number(projectId) },
      data: { deadline: new Date(deadline) },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json(
      { error: "마감일 변경 실패", detail: String(error) },
      { status: 500 }
    );
  }
}
