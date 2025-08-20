// app/api/tasks/route.ts
import { prisma } from "@/lib/prisma";
import { updateProjectProgress } from "@/lib/utils/services/project";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const status = body.status;
    const projectId = Number(body.projectId);
    const orderType = body.orderType;
    const index = body.index ?? null; // 중간 삽입
    const progress = body.progress;

    // 1. 같은 컬럼의 task 최소 데이터만 조회
    const tasks = await prisma.task.findMany({
      where: { status, projectId },
      orderBy: { order: "asc" },
      select: { id: true, order: true },
    });

    let newOrder: number;

    if (tasks.length === 0) {
      newOrder = 0;
    } else if (orderType === "top") {
      newOrder = tasks[0].order! - 1;
    } else if (orderType === "bottom") {
      newOrder = tasks[tasks.length - 1].order! + 1;
    } else if (index !== null) {
      const prevOrder = tasks[index - 1]?.order ?? 0;
      const nextOrder = tasks[index]?.order ?? prevOrder + 2;
      newOrder =
        prevOrder === nextOrder
          ? prevOrder + 0.0001
          : (prevOrder + nextOrder) / 2;
    } else {
      newOrder = tasks[tasks.length - 1].order! + 1;
    }

    const newTask = await prisma.task.create({
      data: {
        title: body.title ?? "",
        desc: body.desc ?? "",
        status,
        projectId,
        managerId: Number(body.managerId),
        order: newOrder,
      },
    });

    // progress는 비동기 처리
    updateProjectProgress(projectId, progress).catch(console.error);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Task 생성 에러:", error);
    return NextResponse.json(
      { error: "Task 생성에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
