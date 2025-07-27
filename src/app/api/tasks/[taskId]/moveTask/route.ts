// app/api/tasks/[taskId]/move/route.ts

import { prisma } from "@/lib/prisma";
import { updateProjectProgress } from "@/lib/utils/services/project";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/tasks/[taskId]/moveTask
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;
    const { toColumn, toIndex } = await req.json();

    const id = Number(taskId);

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new Error("Task not found");

    const projectId = task.projectId;

    const targetTasks = await prisma.task.findMany({
      where: {
        status: toColumn,
        projectId,
      },
      orderBy: { order: "asc" },
    });

    const filteredTasks = targetTasks.filter((t) => t.id !== id);
    filteredTasks.splice(toIndex, 0, task);

    await prisma.$transaction([
      prisma.task.update({
        where: { id },
        data: { status: toColumn },
      }),
      ...filteredTasks.map((t, index) =>
        prisma.task.update({
          where: { id: t.id },
          data: { order: index },
        })
      ),
    ]);

    await updateProjectProgress(task.projectId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "이동 실패", detail: String(err) },
      { status: 500 }
    );
  }
}
