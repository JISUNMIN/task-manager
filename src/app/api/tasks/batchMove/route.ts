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

    // 모든 Task의 projectId 가져오기 (같은 프로젝트 가정)
    const projectId = (
      await prisma.task.findUnique({
        where: { id: batch[0].taskId },
        select: { projectId: true },
      })
    )?.projectId;

    if (!projectId) throw new Error("프로젝트를 찾을 수 없음");

    // 1️⃣ 해당 프로젝트의 모든 Task 가져오기
    const allTasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });

    // 2️⃣ 컬럼별로 Task 그룹화
    const columnsMap: Record<string, any[]> = {};
    for (const task of allTasks) {
      if (!columnsMap[task.status]) columnsMap[task.status] = [];
      columnsMap[task.status].push(task);
    }

    // 3️⃣ batch 이동 적용
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

    // 4️⃣ 새 order 계산
    const updates: { id: number; status: string; order: number }[] = [];
    for (const [status, tasks] of Object.entries(columnsMap)) {
      tasks.forEach((task, index) => {
        updates.push({ id: task.id, status, order: index });
      });
    }

    // 5️⃣ 트랜잭션으로 한 번에 업데이트
    await prisma.$transaction(
      updates.map((u) =>
        prisma.task.update({
          where: { id: u.id },
          data: { status: u.status, order: u.order },
        })
      )
    );

    // 6️⃣ Progress 업데이트
    const progress = await updateProjectProgress(projectId);

    const totalTime = Date.now() - startTime;
    return NextResponse.json({
      success: true,
      time: totalTime,
      progress,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "배치 이동 실패", detail: String(err) },
      { status: 500 }
    );
  }
}
