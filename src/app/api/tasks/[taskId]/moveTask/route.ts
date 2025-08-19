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

    // 1. 이동할 task 확인
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new Error("Task not found");
    const projectId = task.projectId;

    // 2. 같은 컬럼의 task 불러오기 (정렬)
    const targetTasks = await prisma.task.findMany({
      where: { status: toColumn, projectId },
      orderBy: { order: "asc" },
      select: { id: true, order: true },
    });

    // 3. 이동할 task 제외 후 배열에 삽입
    const filteredTasks = targetTasks.filter((t) => t.id !== id);
    filteredTasks.splice(toIndex, 0, { id: task.id, order: task.order ?? 0 });

    // 4. 이전/다음 order 계산
    const prevOrder = filteredTasks[toIndex - 1]?.order ?? 0;
    const nextOrder = filteredTasks[toIndex + 1]?.order ?? prevOrder + 2;

    let newOrder: number;
    if (toIndex === 0 && filteredTasks.length === 1) {
      // 컬럼에 유일한 task
      newOrder = 0;
    } else if (toIndex === 0) {
      // 맨 위로 이동
      newOrder = nextOrder - 1;
    } else if (toIndex === filteredTasks.length - 1) {
      // 맨 아래로 이동
      newOrder = prevOrder + 1;
    } else {
      // 중간으로 이동
      newOrder = (prevOrder + nextOrder) / 2;
    }

    // 5. task 업데이트
    await prisma.task.update({
      where: { id },
      data: { status: toColumn, order: newOrder },
    });

    // 6. 프로젝트 진행률 업데이트
    await updateProjectProgress(projectId);

    return NextResponse.json({ success: true, newOrder });
  } catch (err) {
    console.error("Task move error:", err);
    return NextResponse.json(
      { error: "이동 실패", detail: String(err) },
      { status: 500 }
    );
  }
}
