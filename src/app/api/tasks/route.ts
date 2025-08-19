// app/api/tasks/batch-move/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { updateProjectProgress } from "@/lib/utils/services/project/progress";

export async function PATCH(req: NextRequest) {
  console.log("🚀 BATCH MOVE API CALLED!!!");
  const startTime = Date.now();

  try {
    const { moves, projectId } = await req.json();
    // moves: [{ taskId: 1, toColumn: 'InProgress', toIndex: 0 }, ...]

    console.log(`📦 배치 이동: ${moves.length}개 tasks`);

    // 🔥 2초 타임아웃
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 2000)
    );

    try {
      const result = await Promise.race([
        processBatchMove(moves, projectId),
        timeoutPromise,
      ]);

      const totalTime = Date.now() - startTime;
      console.log(`⚡ 배치 처리 완료: ${totalTime}ms`);

      return NextResponse.json({
        success: true,
        processedCount: result.processedCount,
        mode: "fast",
        time: totalTime,
      });
    } catch (error) {
      console.log(`🔄 백그라운드 배치 처리로 전환`);

      processBatchMoveBackground(moves, projectId);

      return NextResponse.json({
        success: true,
        message: `${moves.length}개 작업을 백그라운드에서 처리 중...`,
        mode: "background",
        time: Date.now() - startTime,
      });
    }
  } catch (err) {
    console.error("배치 이동 실패:", err);
    return NextResponse.json(
      { error: "배치 이동 실패", detail: String(err) },
      { status: 500 }
    );
  }
}

// 배치 처리 함수
async function processBatchMove(
  moves: Array<{ taskId: number; toColumn: string; toIndex: number }>,
  projectId: number
) {
  console.log(`🔧 배치 처리 시작: ${moves.length}개`);

  // 1. 모든 관련 tasks를 한번에 조회
  const taskIds = moves.map((m) => m.taskId);
  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds } },
    select: { id: true, projectId: true, status: true, order: true },
  });

  if (tasks.length !== moves.length) {
    throw new Error("일부 Task를 찾을 수 없습니다");
  }

  // 2. 컬럼별로 그룹화
  const movesByColumn = new Map<string, typeof moves>();
  moves.forEach((move) => {
    if (!movesByColumn.has(move.toColumn)) {
      movesByColumn.set(move.toColumn, []);
    }
    movesByColumn.get(move.toColumn)!.push(move);
  });

  // 3. 컬럼별로 기존 tasks 조회
  const columnTasks = new Map<string, any[]>();
  for (const column of movesByColumn.keys()) {
    const existingTasks = await prisma.task.findMany({
      where: { status: column, projectId },
      orderBy: { order: "asc" },
      select: { id: true, order: true },
    });
    columnTasks.set(column, existingTasks);
  }

  // 4. 배치 업데이트 준비
  const updates: Array<{ id: number; status: string; order: number }> = [];

  for (const [column, columnMoves] of movesByColumn.entries()) {
    const existingTasks = columnTasks.get(column) || [];

    // 이동할 tasks 제외
    const movingTaskIds = columnMoves.map((m) => m.taskId);
    const filteredTasks = existingTasks.filter(
      (t) => !movingTaskIds.includes(t.id)
    );

    // 각 이동할 task의 새 order 계산
    columnMoves.forEach((move) => {
      const task = tasks.find((t) => t.id === move.taskId)!;

      // 임시 배열에 삽입해서 order 계산
      const tempTasks = [...filteredTasks];
      tempTasks.splice(move.toIndex, 0, task);

      const prevOrder = tempTasks[move.toIndex - 1]?.order ?? null;
      const nextOrder = tempTasks[move.toIndex + 1]?.order ?? null;

      let newOrder: number;
      if (prevOrder === null && nextOrder === null) newOrder = 0;
      else if (prevOrder === null) newOrder = nextOrder - 1;
      else if (nextOrder === null) newOrder = prevOrder + 1;
      else newOrder = (prevOrder + nextOrder) / 2;

      updates.push({
        id: move.taskId,
        status: move.toColumn,
        order: newOrder,
      });

      // 다음 계산을 위해 이 task를 filteredTasks에 추가
      filteredTasks.splice(move.toIndex, 0, { ...task, order: newOrder });
    });
  }

  // 5. 배치 업데이트 실행
  await prisma.$transaction(
    updates.map((update) =>
      prisma.task.update({
        where: { id: update.id },
        data: { status: update.status, order: update.order },
      })
    )
  );

  console.log(`✅ 배치 업데이트 완료: ${updates.length}개`);
  return { processedCount: updates.length };
}

// 백그라운드 배치 처리
function processBatchMoveBackground(
  moves: Array<{ taskId: number; toColumn: string; toIndex: number }>,
  projectId: number
) {
  setTimeout(async () => {
    try {
      const result = await processBatchMove(moves, projectId);
      console.log(`✅ 백그라운드 배치 처리 완료: ${result.processedCount}개`);

      // Progress 업데이트
      const progress = await updateProjectProgress(projectId);
      console.log(`📊 Progress 업데이트 완료: ${progress}%`);
    } catch (error) {
      console.error(`❌ 백그라운드 배치 처리 실패:`, error);
    }
  }, 0);
}
