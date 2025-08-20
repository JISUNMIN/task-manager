// app/api/tasks/route.ts
import { prisma } from "@/lib/prisma";
import { updateProjectProgress } from "@/lib/utils/services/project";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title = "",
      desc = "",
      status,
      projectId,
      managerId,
      progress,
      order, // 프론트엔드에서 계산된 order 값
    } = body;

    const newTask = await prisma.task.create({
      data: {
        title,
        desc,
        status,
        projectId: Number(projectId),
        managerId: Number(managerId),
        order,
      },
    });

    updateProjectProgress(Number(projectId), progress).catch(console.error);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Task 생성 에러:", error);
    return NextResponse.json(
      { error: "Task 생성에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
