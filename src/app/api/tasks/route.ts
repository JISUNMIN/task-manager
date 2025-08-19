// app/api/tasks/[taskId]/move/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { updateProjectProgress } from "@/lib/utils/services/project/progress";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  console.log("API CALLED!!!");
  const startTime = Date.now();

  try {
    const { taskId } = await context.params;
    const { toColumn, toIndex } = await req.json();
    const id = Number(taskId);

    // 🔥 핵심: 2초 내 완료 안되면 즉시 응답
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 2000)
    );

    try {
      // 빠른 처리 시도
      const result = await Promise.race([
        processTaskMove(id, toColumn, toIndex),
        timeoutPromise,
      ]);

      const totalTime = Date.now() - startTime;
      console.log(`⚡ 빠른 처리 완료: ${totalTime}ms`);

      return NextResponse.json({
        success: true,
        newOrder: result.newOrder,
        mode: "fast",
        time: totalTime,
      });
    } catch (error) {
      // 느리면 백그라운드로 처리하고 즉시 응답
      console.log(`🔄 백그라운드 처리로 전환`);

      processTaskMoveBackground(id, toColumn, toIndex);

      return NextResponse.json({
        success: true,
        message: "처리 중입니다...",
        mode: "background",
        time: Date.now() - startTime,
      });
    }
  } catch (err) {
    return NextResponse.json(
      { error: "이동 실패", detail: String(err) },
      { status: 500 }
    );
  }
}

// 일반 처리 함수 (기존 로직 그대로)
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

// 백그라운드 처리 (에러 발생해도 상관없음)
function processTaskMoveBackground(
  id: number,
  toColumn: string,
  toIndex: number
) {
  setTimeout(async () => {
    try {
      const result = await processTaskMove(id, toColumn, toIndex);
      console.log(`✅ 백그라운드 처리 완료: Task ${id}`);

      // 기존 utils 함수 사용해서 Progress 업데이트
      const task = await prisma.task.findUnique({
        where: { id },
        select: { projectId: true },
      });

      if (task) {
        const progress = await updateProjectProgress(task.projectId);
        console.log(`📊 Progress 업데이트 완료: ${progress}%`);
      }
    } catch (error) {
      console.error(`❌ 백그라운드 처리 실패:`, error);
      // 실패해도 사용자는 이미 성공 응답 받음
    }
  }, 0);
}
