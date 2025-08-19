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
      const result = await Promise.race([
        processBatchMove(batch),
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

// -------------------
// 배치 이동 핵심 함수
async function processBatchMove(batch: BatchMoveItem[]) {
  // projectId 공통으로 가져오기 (첫 task 기준)
  const projectId = (
    await prisma.task.findUnique({
      where: { id: batch[0].taskId },
      select: { projectId: true },
    })
  )?.projectId;
  if (!projectId) throw new Error("Project not found");

  // 프로젝트의 모든 task 조회
  const allTasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    select: { id: true, order: true, status: true },
  });

  // batch 순서대로 status와 index 반영
  batch.forEach(({ taskId, toColumn, toIndex }) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;

    // 타겟 컬럼의 task만 뽑기
    // TODO: 미리 테스크의 속성별로 리스트가 별도로 정리돼있으면 여기서 계쏙 전체를 다시계산할 필요없음
    const targetTasks = allTasks
      .filter((t) => t.status === toColumn && t.id !== taskId)
      .sort((a, b) => a.order! - b.order!);

    // 지정된 위치에 삽입
    targetTasks.splice(toIndex, 0, { ...task, status: toColumn });

    // allTasks 배열 업데이트
    targetTasks.forEach((t, idx) => {
      const orig = allTasks.find((ot) => ot.id === t.id);
      if (orig) {
        orig.order = idx;
        orig.status = t.status;
      }
    });
    console.log("🚀 ~ processBatchMove ~ targetTasks:", targetTasks);
  });

  // DB에 bulk update
  console.log("🚀 ~ processBatchMove ~ allTasks:", allTasks);

  await Promise.all(
    allTasks.map((t) =>
      prisma.task.update({
        where: { id: t.id },
        data: { order: t.order, status: t.status },
      })
    )
  );

  // 결과 반환
  return allTasks.map((t) => ({ taskId: t.id, newOrder: t.order }));
}

// -------------------
// 백그라운드 처리
function processBatchMoveBackground(batch: BatchMoveItem[]) {
  setTimeout(async () => {
    try {
      const result = await processBatchMove(batch);

      // 관련 프로젝트 Progress 업데이트
      const projectIds = Array.from(new Set(result.map((r) => r.taskId)));

      for (const id of projectIds) {
        const task = await prisma.task.findUnique({
          where: { id },
          select: { projectId: true },
        });
        if (task?.projectId) {
          const progress = await updateProjectProgress(task.projectId);
          console.log(`📊 Progress 업데이트 완료: ${progress}%`);
        }
      }

      console.log("✅ 백그라운드 배치 처리 완료");
    } catch (err) {
      console.error("❌ 백그라운드 배치 처리 실패:", err);
    }
  }, 0);
}
