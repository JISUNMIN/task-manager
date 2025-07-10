// app/api/tasks/[taskId]/status/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const { status } = await req.json();

    const updatedTask = await prisma.task.update({
      where: { id: Number(taskId) },
      data: { status },
    });
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Task 상태 업데이트 실패", detail: String(error) },
      { status: 500 }
    );
  }
}
