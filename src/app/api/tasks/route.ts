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
    const index = body.index ?? null; // 중간에 삽입할 경우 사용

    let newOrder: number;

    // 같은 컬럼의 최소/최대 task order만 조회
    const tasks = await prisma.task.findMany({
      where: { status, projectId },
      orderBy: { order: "asc" },
      select: { id: true, order: true },
    });

    if (tasks.length === 0) {
      newOrder = 0;
    } else if (orderType === "top") {
      newOrder = tasks[0].order! - 1;
    } else if (orderType === "bottom") {
      newOrder = tasks[tasks.length - 1].order! + 1;
    } else if (index !== null) {
      // 중간에 삽입
      const prevOrder = tasks[index - 1]?.order ?? 0;
      const nextOrder = tasks[index]?.order ?? prevOrder + 2;
      newOrder = (prevOrder + nextOrder) / 2;
    } else {
      // 기본 맨 아래
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
    updateProjectProgress(projectId).catch(console.error);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Task 생성 에러:", error);
    return NextResponse.json(
      { error: "Task 생성에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
