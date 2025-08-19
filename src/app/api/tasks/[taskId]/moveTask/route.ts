// app/api/tasks/batchMove/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { updateProjectProgress } from "@/lib/utils/services/project/progress";

interface BatchMoveItem {
  taskId: number;
  toColumn: string;
  toIndex: number;
}

export async function PATCH(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { batch }: { batch: BatchMoveItem[] } = await req.json();

    if (!batch || batch.length === 0) {
      return NextResponse.json(
        { error: "배치 이동 데이터 없음" },
        { status: 400 }
      );
    }

    // 2초 안에 처리되는지 확인
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 2000)
    );

    try {
      // 🔹 순차 처리
      const result = await Promise.race([processBatchMoveSequential(batch), timeoutPromise]);

      const totalTime = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        results: result,
        mode: "fast",
        time: totalTime,
      });
    } catch (error) {
      // 느리면 백그라운드 처리
      processBatchMoveBackground(batch);
      return NextResponse.json({
        success: true,
        message: "처리 중입니다...",
        mode: "background",
        time: Date.now() - startTime,
      });
    }
  } catch (err) {
    return NextResponse.json(
      { error: "배치 이동 실패", detail: String(err) },
      { status: 500 }
    );
  }
}

// -------------------
// 배치 순차 처리
async function processBatchMoveSequential(batch: BatchMoveItem[]) {
  const results = [];
  for (const item of batch) {
    const res = await processTaskMove(item.taskId, item.toColumn, item.toIndex);
    results.push({ taskId: item.taskId, newOrder: res.newOrder });
  }
  return results;
}

// -------------------
// 기존 단일 이동 함수 그대로
async function processTaskMove(id: number, toColumn: string, toIndex: number) {
  const task = await prisma.task.findUnique({
    where: { id },
    select: { id: true, projectId: true, status: true, order: true },
  });
  if (!task) throw new Error("Task not found");

  const targetTasks = await prisma.task.findMany({
    where: { status: toColumn, projectId: task.projectId },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });

  const filteredTasks = targetTasks.filter((t) => t.id !== id);
  filteredTasks.splice(toIndex, 0, task);

  const prevOrder = filteredTasks[toIndex - 1]?.order ?? null;
  const nextOrder = filteredTasks[toIndex + 1]?.order ?? null;

  let newOrder: number;
  if (prevOrder === null && nextOrder === null) newOrder = 0;
  else if (prevOrder === null && nextOrder !== null) newOrder = nextOrder - 1;
  else if (prevOrder !== null && nextOrder === null) newOrder = prevOrder + 1;
  else newOrder = (prevOrder! + nextOrder!) / 2;

  await prisma.task.update({
    where: { id },
    data: { status: toColumn, order: newOrder },
  });

  return { newOrder };
}

// -------------------
// 백그라운드 처리
function processBatchMoveBackground(batch: BatchMoveItem[]) {
  setTimeout(async () => {
    try {
      await processBatchMoveSequential(batch);
      // 필요 시 프로젝트 Progress 업데이트
      const projectIds = Array.from(new Set(batch.map((b) => b.taskId)));
      for (const id of projectIds) {
        const task = await prisma.task.findUnique({
          where: { id },
          select: { projectId: true },
        });
        if (task?.projectId) {
          await updateProjectProgress(task.projectId);
        }
      }
    } catch (err) {
      console.error("❌ 백그라운드 배치 처리 실패:", err);
    }
  }, 0);
}
