import { TaskActivityType, TaskPriority } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CreateTaskActivityParams = {
  taskId: number;
  actorId?: number | null;
  type: TaskActivityType;
  fieldLabel?: string;
  fromValue?: string | null;
  toValue?: string | null;
};

export const TASK_ACTIVITY_LABELS: Record<TaskActivityType, string> = {
  CREATED: "작업 생성",
  TITLE_CHANGED: "제목 변경",
  DESCRIPTION_CHANGED: "본문 변경",
  STATUS_CHANGED: "상태 변경",
  ASSIGNEES_CHANGED: "할당자 변경",
  PRIORITY_CHANGED: "우선순위 변경",
  DUE_DATE_CHANGED: "마감일 변경",
};

export const formatTaskPriorityValue = (priority?: TaskPriority | null) => {
  if (!priority) return "없음";

  if (priority === "HIGH") return "높음";
  if (priority === "LOW") return "낮음";
  return "보통";
};

export const formatTaskDateValue = (date?: Date | string | null) => {
  if (!date) return "미설정";

  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return "미설정";

  return parsed.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const createTaskActivity = async ({
  taskId,
  actorId,
  type,
  fieldLabel,
  fromValue,
  toValue,
}: CreateTaskActivityParams) => {
  await prisma.taskActivity.create({
    data: {
      taskId,
      actorId: actorId ?? null,
      type,
      fieldLabel,
      fromValue: fromValue ?? null,
      toValue: toValue ?? null,
    },
  });
};
