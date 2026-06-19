// /api/tasks/[taskId]  → DELETE (task 삭제)
// /api/tasks/[taskId]   → PATCH (task 수정)

import { authenticate } from "@/lib/auth";
import { AuthError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import {
  createTaskActivity,
  formatTaskDateValue,
  formatTaskPriorityValue,
} from "@/lib/utils/services/taskActivity";
import { updateProjectProgress } from "@/lib/utils/services/project";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { id, role } = authenticate(req);
    const { taskId } = await context.params;
    const { progress } = await req.json();
    const numericTaskId = Number(taskId);

    const task = await prisma.task.findUnique({
      where: { id: numericTaskId },
      include: {
        project: {
          select: { managerId: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task를 찾을 수 없습니다." }, { status: 404 });
    }

    if (role !== "ADMIN" && task.project.managerId !== id) {
      return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
    }

    const newTask = await prisma.task.delete({
      where: { id: numericTaskId },
    });
    await updateProjectProgress(newTask.projectId, progress);
    return NextResponse.json(
      { message: "Task가 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Task 삭제 에러:", error);
    return NextResponse.json(
      { error: "Task 삭제에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { id, role } = authenticate(req);
    const { taskId } = await context.params;
    const { title, desc, assignees, priority, dueDate } = await req.json();
    const numericTaskId = Number(taskId);

    const task = await prisma.task.findUnique({
      where: { id: numericTaskId },
      include: {
        project: {
          select: { managerId: true },
        },
        assignees: {
          select: { id: true, name: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task를 찾을 수 없습니다." }, { status: 404 });
    }

    const canEdit =
      role === "ADMIN" ||
      task.project.managerId === id ||
      task.assignees.some((assignee) => assignee.id === id);

    if (!canEdit) {
      return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });
    }

    const updateData: Prisma.TaskUpdateInput = {};
    const activityLogs: Promise<unknown>[] = [];

    if (title !== undefined) {
      updateData.title = title;
      if (title !== task.title) {
        activityLogs.push(
          createTaskActivity({
            taskId: numericTaskId,
            actorId: id,
            type: "TITLE_CHANGED",
            fieldLabel: "제목",
            fromValue: task.title,
            toValue: title,
          }),
        );
      }
    }

    if (desc !== undefined) {
      updateData.desc = desc;
      if (desc !== task.desc) {
        activityLogs.push(
          createTaskActivity({
            taskId: numericTaskId,
            actorId: id,
            type: "DESCRIPTION_CHANGED",
            fieldLabel: "본문",
            fromValue: task.desc ? "작성됨" : "비어 있음",
            toValue: desc ? "작성됨" : "비어 있음",
          }),
        );
      }
    }

    if (Array.isArray(assignees)) {
      updateData.assignees = {
        set: [],
        connect: assignees
          .filter((id) => typeof id === "number")
          .map((id) => ({ id })),
      };

      const previousAssigneeIds = task.assignees.map((assignee) => assignee.id).sort((a, b) => a - b);
      const nextAssigneeIds = assignees.filter((value: unknown): value is number => typeof value === "number").sort((a, b) => a - b);

      if (previousAssigneeIds.join(",") !== nextAssigneeIds.join(",")) {
        const nextAssignees = await prisma.user.findMany({
          where: { id: { in: nextAssigneeIds } },
          select: { name: true },
        });

        activityLogs.push(
          createTaskActivity({
            taskId: numericTaskId,
            actorId: id,
            type: "ASSIGNEES_CHANGED",
            fieldLabel: "할당자",
            fromValue:
              task.assignees.length > 0
                ? task.assignees.map((assignee) => assignee.name).join(", ")
                : "미지정",
            toValue:
              nextAssignees.length > 0
                ? nextAssignees.map((assignee) => assignee.name).join(", ")
                : "미지정",
          }),
        );
      }
    }

    if (priority !== undefined) {
      updateData.priority = priority;

      if (priority !== task.priority) {
        activityLogs.push(
          createTaskActivity({
            taskId: numericTaskId,
            actorId: id,
            type: "PRIORITY_CHANGED",
            fieldLabel: "우선순위",
            fromValue: formatTaskPriorityValue(task.priority),
            toValue: formatTaskPriorityValue(priority),
          }),
        );
      }
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;

      const previousDate = task.dueDate ? task.dueDate.toISOString().slice(0, 10) : null;
      const nextDate = typeof dueDate === "string" && dueDate.length > 0 ? dueDate : null;

      if (previousDate !== nextDate) {
        activityLogs.push(
          createTaskActivity({
            taskId: numericTaskId,
            actorId: id,
            type: "DUE_DATE_CHANGED",
            fieldLabel: "마감일",
            fromValue: formatTaskDateValue(task.dueDate),
            toValue: formatTaskDateValue(nextDate),
          }),
        );
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "수정할 필드가 없습니다." },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id: numericTaskId },
      data: updateData,
      include: {
        assignees: {
          select: { id: true },
        },
      },
    });

    if (activityLogs.length > 0) {
      await Promise.all(activityLogs);
    }

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Task 수정 에러:", error);
    return NextResponse.json(
      { error: "Task 수정에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
