// /api/tasks/[taskId]  → DELETE (task 삭제)
// /api/tasks/[taskId]   → PUT (task 수정)

import { prisma } from "@/lib/prisma";
import { updateProjectProgress } from "@/lib/utils/services/project";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;

    const newTask = await prisma.task.delete({
      where: { id: Number(taskId) },
    });
    await updateProjectProgress(newTask.projectId);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Task 삭제 에러:", error);
    return NextResponse.json(
      { error: "Task 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { title, desc, assignees } = await req.json();
    const { taskId } = await context.params;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (desc !== undefined) updateData.desc = desc;

    if (Array.isArray(assignees)) {
      updateData.assignees = {
        set: [],
        connect: assignees
          .filter((id) => typeof id === "number")
          .map((id) => ({ id })),
      };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "수정할 필드가 없습니다." },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(taskId) },
      data: updateData,
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("Task 수정 에러:", error);
    return NextResponse.json(
      { error: "Task 수정에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
