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

    // 1. 같은 컬럼의 task 불러오기 (정렬)
    const targetTasks = await prisma.task.findMany({
      where: { status: toColumn, projectId },
      orderBy: { order: "asc" },
    });

    // 2. 이동할 task 제외 후 새로운 순서 계산
    const filteredTasks = targetTasks.filter((t) => t.id !== id);
    filteredTasks.splice(toIndex, 0, task);

    // 3. 이전/다음 task order 계산
    const prevOrder = filteredTasks[toIndex - 1]?.order ?? 0;
    const nextOrder = filteredTasks[toIndex + 1]?.order ?? prevOrder + 2;

    // 새로운 order는 prev와 next 사이의 중간값
    const newOrder = (prevOrder + nextOrder) / 2;

    // 4. 이동 task만 업데이트
    await prisma.task.update({
      where: { id },
      data: { status: toColumn, order: newOrder },
    });

    await updateProjectProgress(projectId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "이동 실패", detail: String(err) },
      { status: 500 }
    );
  }
}
