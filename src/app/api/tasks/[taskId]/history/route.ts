import { authenticate } from "@/lib/auth";
import { AuthError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { TASK_ACTIVITY_LABELS } from "@/lib/utils/services/taskActivity";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> },
) {
  try {
    const { id, role } = authenticate(req);
    const { taskId } = await context.params;
    const numericTaskId = Number(taskId);

    const task = await prisma.task.findUnique({
      where: { id: numericTaskId },
      include: {
        project: {
          select: { managerId: true },
        },
        assignees: {
          select: { id: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task를 찾을 수 없습니다." }, { status: 404 });
    }

    const canAccess =
      role === "ADMIN" ||
      task.project.managerId === id ||
      task.assignees.some((assignee) => assignee.id === id);

    if (!canAccess) {
      return NextResponse.json({ error: "조회 권한이 없습니다." }, { status: 403 });
    }

    const activities = await prisma.taskActivity.findMany({
      where: { taskId: numericTaskId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            userId: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json(
      activities.map((activity) => ({
        ...activity,
        label: TASK_ACTIVITY_LABELS[activity.type],
      })),
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("GET /api/tasks/[taskId]/history 에러:", error);
    return NextResponse.json({ error: "활동 로그를 불러오지 못했습니다." }, { status: 500 });
  }
}
