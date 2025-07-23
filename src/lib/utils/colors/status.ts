// utils/colors/status.ts
import { Status } from "@/store/useKanbanStore";
import {  useThemeStore } from "@/store/useThemeStore";

export const getStatusColors = (status: Status) => {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  switch (status) {
    case "To Do":
      return {
        statusBgColor: isDark ? "bg-slate-600" : "bg-gray-400",
        dotColor: isDark ? "bg-slate-300" : "bg-gray-500",
        kanbanBoardBg: isDark ? "bg-slate-800" : "bg-gray-100",
      };
    case "Ready":
      return {
        statusBgColor: isDark ? "bg-cyan-600" : "bg-blue-500",
        dotColor: isDark ? "bg-cyan-300" : "bg-blue-600",
        kanbanBoardBg: isDark ? "bg-cyan-900" : "bg-blue-50",
      };
    case "In Progress":
      return {
        statusBgColor: isDark ? "bg-yellow-600" : "bg-yellow-500",
        dotColor: isDark ? "bg-yellow-300" : "bg-yellow-600",
        kanbanBoardBg: isDark ? "bg-yellow-900" : "bg-yellow-50",
      };

    case "On Hold":
      return {
        statusBgColor: isDark ? "bg-orange-600" : "bg-orange-500",
        dotColor: isDark ? "bg-orange-300" : "bg-orange-600",
        kanbanBoardBg: isDark ? "bg-orange-900" : "bg-orange-50",
      };

    case "Completed":
      return {
        statusBgColor: isDark ? "bg-emerald-600" : "bg-green-500",
        dotColor: isDark ? "bg-emerald-300" : "bg-green-600",
        kanbanBoardBg: isDark ? "bg-emerald-900" : "bg-green-50",
      };

    default:
      return {
        statusBgColor: isDark ? "bg-zinc-700" : "bg-gray-400",
        dotColor: isDark ? "bg-zinc-400" : "bg-gray-500",
        kanbanBoardBg: isDark ? "bg-zinc-900" : "bg-gray-50",
      };
  }
};
