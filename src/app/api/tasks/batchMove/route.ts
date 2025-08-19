// app/api/tasks/batchMove/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { updateProjectProgress } from "@/lib/utils/services/project/progress";

interface BatchMoveItem {
  taskId: number;
  toColumn: string;
  toIndex: number;
}

// 실제 배치 이동 처리
async function processBatchMove(batch: BatchMoveItem[]) {
  if (!batch || batch.length === 0) return;

  // 프로젝트 ID 가져오기 (모든 Task가 같은 프로젝트라고 가정)
  const projectId = (
    await prisma.task.findUnique({
      where: { id: batch[0].taskId },
      select: { projectId: true },
    })
  )?.projectId;
  if (!projectId) throw new Error("프로젝트를 찾을 수 없음");

  // 프로젝트 전체 Task 조회
  const allTasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });

  // 컬럼별 그룹화
  const columnsMap: Record<string, any[]> = {};
  for (const task of allTasks) {
    if (!columnsMap[task.status]) columnsMap[task.status] = [];
    columnsMap[task.status].push(task);
  }

  // batch 이동 적용
  for (const move of batch) {
    const task = allTasks.find((t) => t.id === move.taskId);
    if (!task) continue;

    // 원래 컬럼에서 제거
    columnsMap[task.status] = columnsMap[task.status].filter(
      (t) => t.id !== task.id
    );

    // 새 컬럼에 삽입
    if (!columnsMap[move.toColumn]) columnsMap[move.toColumn] = [];
    columnsMap[move.toColumn].splice(move.toIndex, 0, {
      ...task,
      status: move.toColumn,
    });
  }

  // order 계산
  const updates: { id: number; status: string; order: number }[] = [];
  for (const [status, tasks] of Object.entries(columnsMap)) {
    tasks.forEach((task, index) => {
      updates.push({ id: task.id, status, order: index });
    });
  }

  // 트랜잭션으로 업데이트
  await prisma.$transaction(
    updates.map((u) =>
      prisma.task.update({
        where: { id: u.id },
        data: { status: u.status, order: u.order },
      })
    )
  );

  // Progress 업데이트
  await updateProjectProgress(projectId);

  return updates.map((u) => ({ taskId: u.id, newOrder: u.order }));
}

// 백그라운드 처리
function processBatchMoveBackground(batch: BatchMoveItem[]) {
  setTimeout(async () => {
    try {
      await processBatchMove(batch);
      console.log("✅ 백그라운드 배치 처리 완료");
    } catch (err) {
      console.error("❌ 백그라운드 배치 처리 실패:", err);
    }
  }, 0);
}

// PATCH 핸들러
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

    // 2초 타임아웃
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 2000)
    );

    try {
      const result = await Promise.race([
        processBatchMove(batch),
        timeoutPromise,
      ]);
      const totalTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        results: result,
        mode: "fast",
        time: totalTime,
      });
    } catch (err) {
      // 2초 이상 걸리면 백그라운드 처리
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
