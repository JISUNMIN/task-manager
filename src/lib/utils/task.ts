import { TaskPriority } from "@prisma/client";

export const TASK_PRIORITY_OPTIONS: TaskPriority[] = ["HIGH", "MEDIUM", "LOW"];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
};

export type TaskDueStatus = "overdue" | "today" | "soon" | "normal" | "none";

export const formatTaskDueDate = (dueDate?: string | Date | null) => {
  if (!dueDate) return "";
  const date = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatTaskDateForInput = (dueDate?: string | Date | null) => {
  if (!dueDate) return "";

  const date = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getTaskDueStatus = (dueDate?: string | Date | null): TaskDueStatus => {
  if (!dueDate) return "none";

  const date = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  if (Number.isNaN(date.getTime())) return "none";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays <= 3) return "soon";
  return "normal";
};

export const getTaskDueStatusLabel = (dueDate?: string | Date | null) => {
  const status = getTaskDueStatus(dueDate);

  switch (status) {
    case "overdue":
      return "기한 지남";
    case "today":
      return "오늘 마감";
    case "soon":
      return "곧 마감";
    case "normal":
      return "마감 예정";
    default:
      return "미설정";
  }
};
