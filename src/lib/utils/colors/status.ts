// utils/colors/status.ts
import { Status } from "@/store/useKanbanStore";

export const getStatusColors = (status: Status, isDark: boolean) => {
  const darkKanbanBg = "bg-[var(--box-bg)]";

  switch (status) {
    case "To Do":
      return {
        statusBgColor: isDark ? "bg-slate-800" : "bg-gray-400",
        dotColor: isDark ? "bg-slate-400" : "bg-gray-500",
        kanbanBoardBg: isDark ? darkKanbanBg : "bg-gray-100",
      };
    case "Ready":
      return {
        statusBgColor: isDark ? "bg-cyan-900" : "bg-blue-500",
        dotColor: isDark ? "bg-cyan-400" : "bg-blue-600",
        kanbanBoardBg: isDark ? darkKanbanBg : "bg-blue-50",
      };
    case "In Progress":
      return {
        statusBgColor: isDark ? "bg-yellow-900" : "bg-yellow-500",
        dotColor: isDark ? "bg-yellow-400" : "bg-yellow-600",
        kanbanBoardBg: isDark ? darkKanbanBg : "bg-yellow-50",
      };
    case "On Hold":
      return {
        statusBgColor: isDark ? "bg-orange-900" : "bg-orange-500",
        dotColor: isDark ? "bg-orange-400" : "bg-orange-600",
        kanbanBoardBg: isDark ? darkKanbanBg : "bg-orange-50",
      };
    case "Completed":
      return {
        statusBgColor: isDark ? "bg-emerald-900" : "bg-green-500",
        dotColor: isDark ? "bg-emerald-400" : "bg-green-600",
        kanbanBoardBg: isDark ? darkKanbanBg : "bg-green-50",
      };
    default:
      return {
        statusBgColor: isDark ? "bg-zinc-900" : "bg-gray-400",
        dotColor: isDark ? "bg-zinc-400" : "bg-gray-500",
        kanbanBoardBg: isDark ? darkKanbanBg : "bg-gray-50",
      };
  }
};
