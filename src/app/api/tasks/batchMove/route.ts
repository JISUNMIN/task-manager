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

    if (!batch || !Array.isArray(batch) || batch.length === 0) {
      return NextResponse.json(
        { error: "배치 이동 데이터 없음" },
        { status: 400 }
      );
    }

    // 2초 안에 처리되는지 확인하는 Promise
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 2000)
    );

    try {
      // 모든 Task를 병렬 처리
      const result = await Promise.race([
        Promise.all(
          batch.map(({ taskId, toColumn, toIndex }) =>
            processTaskMove(taskId, toColumn, toIndex)
          )
        ),
        timeoutPromise,
      ]);

      const totalTime = Date.now() - startTime;
      console.log(`⚡ 빠른 처리 완료: ${totalTime}ms`);

      return NextResponse.json({
        success: true,
        results: result,
        mode: "fast",
        time: totalTime,
      });
    } catch (error) {
      console.log("🔄 백그라운드 처리로 전환");
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

// 단일 Task 이동 함수 (기존과 동일)
async function processTaskMove(id: number, toColumn: string, toIndex: number) {
  const task = await prisma.task.findUnique({
    where: { id },
    select: { id: true, projectId: true, status: true, order: true },
  });

  if (!task) throw new Error(`Task ${id} not found`);

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

  return { taskId: id, newOrder };
}

// 백그라운드 배치 처리
function processBatchMoveBackground(batch: BatchMoveItem[]) {
  setTimeout(async () => {
    try {
      await Promise.all(
        batch.map(({ taskId, toColumn, toIndex }) =>
          processTaskMove(taskId, toColumn, toIndex)
        )
      );

      // 관련 프로젝트 Progress 업데이트
      const projectIds = Array.from(
        new Set(batch.map(({ taskId }) => taskId))
      ).map(async (id) => {
        const task = await prisma.task.findUnique({
          where: { id },
          select: { projectId: true },
        });
        return task?.projectId;
      });

      for await (const projectId of projectIds) {
        if (projectId) {
          const progress = await updateProjectProgress(projectId);
          console.log(`📊 Progress 업데이트 완료: ${progress}%`);
        }
      }

      console.log("✅ 백그라운드 배치 처리 완료");
    } catch (err) {
      console.error("❌ 백그라운드 배치 처리 실패:", err);
    }
  }, 0);
}
