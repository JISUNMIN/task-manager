// app/api/tasks/[taskId]/move/route.ts
import { authenticate } from "@/lib/auth";
import { AuthError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { updateProjectProgress } from "@/lib/utils/services/project/progress";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { id, role } = authenticate(req);
    const { taskId } = await context.params;
    const { projectId, toColumn, order, progress } = await req.json(); // 프론트에서 계산한 Order
    const numericTaskId = Number(taskId);

    const task = await prisma.task.findUnique({
      where: { id: numericTaskId },
      include: {
        project: {
          select: { managerId: true },
        },
        assignees: {
          select: { id: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task를 찾을 수 없습니다." }, { status: 404 });
    }

    const canMove =
      role === "ADMIN" ||
      task.project.managerId === id ||
      task.assignees.some((assignee) => assignee.id === id);

    if (!canMove) {
      return NextResponse.json({ error: "이동 권한이 없습니다." }, { status: 403 });
    }

    await prisma.task.update({
      where: { id: numericTaskId },
      data: { status: toColumn, order: order },
    });

    updateProjectProgress(projectId, progress);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json(
      { error: "이동 실패", detail: String(err) },
      { status: 500 }
    );
  }
}
