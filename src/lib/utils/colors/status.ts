// utils/colors/status.ts
import { Status } from "@/store/useKanbanStore";

export const getStatusColors = (status: Status) => {
  switch (status) {
    case "To Do":
      return {
        statusBgColor: "bg-gray-400",
        dotColor: "bg-gray-500",
        kanbanBoardBg: "bg-gray-100",
      };
    case "Ready":
      return {
        statusBgColor: "bg-blue-500",
        dotColor: "bg-blue-600",
        kanbanBoardBg: "bg-blue-50",
      };
    case "In Progress":
      return {
        statusBgColor: "bg-yellow-500",
        dotColor: "bg-yellow-600",
        kanbanBoardBg: "bg-yellow-50",
      };
    case "On Hold":
      return {
        statusBgColor: "bg-orange-500",
        dotColor: "bg-orange-600",
        kanbanBoardBg: "bg-orange-50",
      };
    case "Completed":
      return {
        statusBgColor: "bg-green-500",
        dotColor: "bg-green-600",
        kanbanBoardBg: "bg-green-50",
      };
    default:
      return {
        statusBgColor: "bg-gray-400",
        dotColor: "bg-gray-500",
        kanbanBoardBg: "bg-gray-50",
      };
  }
};
