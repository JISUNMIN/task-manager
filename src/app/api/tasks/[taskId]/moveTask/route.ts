// app/api/tasks/[taskId]/move/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { updateProjectProgress } from "@/lib/utils/services/project/progress";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;
    const { projectId, toColumn, order, progress } = await req.json(); // 프론트에서 계산한 Order
    const id = Number(taskId);

    await prisma.task.update({
      where: { id },
      data: { status: toColumn, order: order },
    });

    updateProjectProgress(projectId, progress);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "이동 실패", detail: String(err) },
      { status: 500 }
    );
  }
}
