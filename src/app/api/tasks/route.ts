// app/api/tasks/[taskId]/move/route.ts
import { prisma } from "@/lib/prisma";
import { updateProjectProgress } from "@/lib/utils/services/project";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/tasks/[taskId]/move
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;
    const { toColumn, toIndex } = await req.json();
    const id = Number(taskId);

    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, projectId: true, status: true, order: true },
    });
    if (!task) throw new Error("Task not found");

    const projectId = task.projectId;

    // 1. 같은 컬럼의 task 최소 데이터만 불러오기
    const targetTasks = await prisma.task.findMany({
      where: { status: toColumn, projectId },
      orderBy: { order: "asc" },
      select: { id: true, order: true },
    });

    // 2. 이동할 task 제외 후 새로운 순서 계산
    const filteredTasks = targetTasks.filter((t) => t.id !== id);
    filteredTasks.splice(toIndex, 0, task);

    // 3. 이전/다음 order 계산
    const prevOrder = filteredTasks[toIndex - 1]?.order ?? null;
    const nextOrder = filteredTasks[toIndex + 1]?.order ?? null;

    let newOrder: number;
    if (prevOrder === null && nextOrder === null) newOrder = 0;
    else if (prevOrder === null && nextOrder !== null) newOrder = nextOrder - 1;
    else if (prevOrder !== null && nextOrder === null) newOrder = prevOrder + 1;
    else newOrder = (prevOrder! + nextOrder!) / 2;

    // 4. 이동 task만 업데이트
    const update = await prisma.task.update({
      where: { id },
      data: { status: toColumn, order: newOrder },
    });

    // 5. progress 계산은 비동기 처리 (응답 먼저)
    updateProjectProgress(projectId).catch((err) =>
      console.error("Progress update failed:", err)
    );

    return NextResponse.json({ success: true, newOrder });
  } catch (err) {
    console.error("Task move error:", err);
    return NextResponse.json(
      { error: "이동 실패", detail: String(err) },
      { status: 500 }
    );
  }
}
