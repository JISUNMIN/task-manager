//  → POST (task 생성)
// app/api/tasks/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newTask = await prisma.task.create({
      data: {
        title: "",
        desc: "",
        status: body.status ?? "To Do",
        projectId: Number(body.projectId),
        managerId: Number(body.managerId),
      },
    });
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Task 생성 에러:", error);
    return NextResponse.json(
      { error: "Task 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
