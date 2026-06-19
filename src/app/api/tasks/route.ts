// app/api/tasks/route.ts
import { authenticate } from "@/lib/auth";
import { AuthError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { createTaskActivity } from "@/lib/utils/services/taskActivity";
import { updateProjectProgress } from "@/lib/utils/services/project";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id, role } = authenticate(req);
    const body = await req.json();
    const {
      title = "",
      desc = "",
      status,
      projectId,
      progress,
      priority = "MEDIUM",
      dueDate = null,
      order, // 프론트엔드에서 계산된 order 값
    } = body;

    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) },
      select: { id: true, managerId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
    }

    if (role !== "ADMIN" && project.managerId !== id) {
      return NextResponse.json({ error: "생성 권한이 없습니다." }, { status: 403 });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        desc,
        status,
        projectId: Number(projectId),
        managerId: project.managerId,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        order,
      },
    });

    await createTaskActivity({
      taskId: newTask.id,
      actorId: id,
      type: "CREATED",
      fieldLabel: "작업",
      toValue: newTask.title || "새 작업",
    });

    updateProjectProgress(Number(projectId), progress).catch(console.error);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Task 생성 에러:", error);
    return NextResponse.json(
      { error: "Task 생성에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
