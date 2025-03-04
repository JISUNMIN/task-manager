import { status } from "@/store/useKanbanStore";
import React from "react";

const getBadgeColors = (
  columnKey: "To Do" | "Ready" | "In Progress" | "On Hold" | "Completed"
) => {
  switch (columnKey) {
    case "To Do":
      return { bgColor: "gray-400", dotColor: "gray-500" };
    case "Ready":
      return { bgColor: "blue-500", dotColor: "blue-600" };
    case "In Progress":
      return { bgColor: "yellow-500", dotColor: "yellow-600" };
    case "On Hold":
      return { bgColor: "orange-500", dotColor: "orange-600" };
    case "Completed":
      return { bgColor: "green-500", dotColor: "green-600" };
    default:
      return { bgColor: "gray-400", dotColor: "gray-500" };
  }
};

const KanbanColumnBadge = ({ columnKey }: { columnKey: status }) => {
  const { bgColor, dotColor } = getBadgeColors(columnKey);

  return (
    <div
      className={`flex items-center space-x-2 border border-solid bg-${bgColor} rounded-2xl pr-3 pl-3`}
    >
      <div
        className={`w-3 h-3 bg-${dotColor} rounded-full border-2 border-${dotColor}`}
      ></div>
      <span className={`text-xl font-semibold text-gray-100`}>{columnKey}</span>
    </div>
  );
};

export default KanbanColumnBadge;
