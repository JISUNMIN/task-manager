"use client";

import { Badge } from "@/components/ui/badge";
import { Status } from "@/store/useKanbanStore";
import React from "react";
import { getStatusColors } from "@/lib/utils/colors/index";

interface KanbanColumnBadgeProps {
  columnKey: Status;
  isDark: boolean;
  count?: number;
}

const KanbanColumnBadge = ({
  columnKey,
  isDark,
  count,
}: KanbanColumnBadgeProps) => {
  const { statusBgColor, dotColor } = getStatusColors(columnKey, isDark);

  return (
    <Badge
      className={`${statusBgColor} rounded-2xl pr-3 pl-3 flex items-center gap-2`}
    >
      <div
        className={`w-3 h-3 ${dotColor} rounded-full border-2 border-solid ${dotColor}`}
      ></div>
      <span className="text-lg  font-semibold text-gray-100">{columnKey}</span>
      {count !== undefined && (
        <span className="ml-2 text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-300 rounded-full px-3 py-0.5 border border-gray-300">
          {" "}
          {count === 0 ? "-" : count}{" "}
        </span>
      )}
    </Badge>
  );
};

export default KanbanColumnBadge;
