// utils/colors/status.ts
import { Status } from "@/store/useKanbanStore";

export const getStatusColors = (status: Status, isDark: boolean) => {
  const darkKanbanBg = "bg-[var(--surface-2)]";
  const darkCompletedBg = "bg-[#121d29]";

  switch (status) {
    case "To Do":
      return {
        statusBgColor: isDark ? "bg-[#1f4fc4]" : "bg-gray-400",
        dotColor: isDark ? "bg-[#6ea8ff]" : "bg-gray-500",
        kanbanBoardBg: isDark ? darkKanbanBg : "bg-[#f8fafc]",
      };
    case "Ready":
      return {
        statusBgColor: isDark ? "bg-[#0b7ea0]" : "bg-blue-500",
        dotColor: isDark ? "bg-[#56d2ff]" : "bg-blue-600",
        kanbanBoardBg: isDark ? darkKanbanBg : "bg-[#f3f8fd]",
      };
    case "In Progress":
      return {
        statusBgColor: isDark ? "bg-[#aa6500]" : "bg-yellow-500",
        dotColor: isDark ? "bg-[#f8bf55]" : "bg-yellow-600",
        kanbanBoardBg: isDark ? darkKanbanBg : "bg-[#fbf7ee]",
      };
    case "On Hold":
      return {
        statusBgColor: isDark ? "bg-[#b24b08]" : "bg-orange-500",
        dotColor: isDark ? "bg-[#ff9b5f]" : "bg-orange-600",
        kanbanBoardBg: isDark ? darkKanbanBg : "bg-[#fcf4ee]",
      };
    case "Completed":
      return {
        statusBgColor: isDark ? "bg-[#007a5a]" : "bg-green-500",
        dotColor: isDark ? "bg-[#26d3a2]" : "bg-green-600",
        kanbanBoardBg: isDark ? darkCompletedBg : "bg-[#eef8f3]",
      };
    default:
      return {
        statusBgColor: isDark ? "bg-zinc-900" : "bg-gray-400",
        dotColor: isDark ? "bg-zinc-400" : "bg-gray-500",
        kanbanBoardBg: isDark ? darkKanbanBg : "bg-[#f8fafc]",
      };
  }
};
