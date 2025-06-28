// /api/tasks/[taskId]  → DELETE (task 삭제)
// /api/tasks/[taskId]   → PUT (task 수정)

import { prisma } from "@/lib/prisma";
import { Status } from "@/store/useKanbanStore";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    const newTask = await prisma.task.delete({
      where: { id: Number(taskId) },
    });
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Task 삭제 에러:", error);
    return NextResponse.json(
      { error: "Task 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      taskId: string;
      title: string;
      desc?: string;
      status?: Status;
    }>;
  }
) {
  try {
    const { title, desc, status } = await req.json();
    const { taskId } = await params;
    console.log("params선밍쓰", params);

    const newTask = await prisma.task.update({
      where: { id: Number(taskId) },
      data: {
        title: title,
        desc: desc,
        status: status,
      },
    });
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.log("Task 업데이트 에러:", error);
    return NextResponse.json(
      { error: "Task 업데이트에 실패했습니다" },
      { status: 500 }
    );
  }
}
