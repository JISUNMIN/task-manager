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

    // 1. 같은 컬럼의 task 불러오기
    const targetTasks = await prisma.task.findMany({
      where: { status: toColumn, projectId },
      orderBy: { order: "asc" },
    });

    // 2. 이동할 task 제외 후 새로운 순서 계산
    const filteredTasks = targetTasks.filter((t) => t.id !== id);
    filteredTasks.splice(toIndex, 0, task);

    // 3. 실제로 order가 바뀐 task만 업데이트
    const tasksToUpdate = filteredTasks
      .map((t, index) => ({ id: t.id, newOrder: index }))
      .filter(
        (t) =>
          t.id !== id &&
          targetTasks.find((orig) => orig.id === t.id)?.order !== t.newOrder
      );

    // 4. 트랜잭션으로 업데이트 (이동 task + 변경된 task들)
    const updates: any[] = [
      prisma.task.update({
        where: { id },
        data: { status: toColumn, order: toIndex },
      }),
      ...tasksToUpdate.map((t) =>
        prisma.task.update({ where: { id: t.id }, data: { order: t.newOrder } })
      ),
    ];

    await prisma.$transaction(updates);

    // 5. 프로젝트 진행률 계산은 비동기로 처리
    updateProjectProgress(projectId).catch((err) => console.error(err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "이동 실패", detail: String(err) },
      { status: 500 }
    );
  }
}
