//  → POST (task 생성)
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

    let newOrder: number;

    if (orderType === "top") {
      // 맨 위에 추가: 최소 order - 1
      const minOrderTask = await prisma.task.findFirst({
        where: { status, projectId },
        orderBy: { order: "asc" },
      });
      newOrder = minOrderTask ? minOrderTask.order! - 1 : 0;
    } else {
      // 맨 밑에 추가 (기본): 최대 order + 1
      const maxOrderTask = await prisma.task.findFirst({
        where: { status, projectId },
        orderBy: { order: "desc" },
      });
      newOrder = maxOrderTask ? maxOrderTask.order! + 1 : 0;
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
    await updateProjectProgress(newTask.projectId);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Task 생성 에러:", error);
    return NextResponse.json(
      { error: "Task 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
