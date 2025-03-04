import { status } from "@/store/useKanbanStore";
import React from "react";

const KanbanColumnBadge = ({ columnKey }: { columnKey: status }) => {
  let bgColor, dotColor;

  switch (columnKey) {
    case "To Do":
      bgColor = "bg-gray-400";
      dotColor = "bg-gray-500";
      break;
    case "Ready":
      bgColor = "bg-blue-500";
      dotColor = "bg-blue-600";
      break;
    case "In Progress":
      bgColor = "bg-yellow-500";
      dotColor = "bg-yellow-600";
      break;
    case "On Hold":
      bgColor = "bg-orange-500";
      dotColor = "bg-orange-600";
      break;
    case "Completed":
      bgColor = "bg-green-500";
      dotColor = "bg-green-600";
      break;
    default:
      bgColor = "bg-gray-400";
      dotColor = "bg-gray-500";
  }

  return (
    <div
      className={`flex items-center space-x-2 border border-solid ${bgColor} rounded-2xl pr-3 pl-3`}
    >
      <div
        className={`w-3 h-3 ${dotColor} rounded-full border-2 border-solid ${dotColor}`}
      ></div>
      <span className="text-xl font-semibold text-gray-100">{columnKey}</span>
    </div>
  );
};

export default KanbanColumnBadge;
