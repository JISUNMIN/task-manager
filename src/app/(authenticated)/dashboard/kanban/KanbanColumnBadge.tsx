"use client";

import { Badge } from "@/components/ui/badge";
import { Status } from "@/store/useKanbanStore";
import React from "react";
import { getStatusColors } from "@/lib/utils/colors/index";

const KanbanColumnBadge = ({
  columnKey,
  isDark,
}: {
  columnKey: Status;
  isDark: boolean;
}) => {
  const { statusBgColor, dotColor } = getStatusColors(columnKey, isDark);

  return (
    <Badge
      className={`${statusBgColor} rounded-2xl pr-3 pl-3 flex items-center gap-2`}
    >
      <div
        className={`w-3 h-3 ${dotColor} rounded-full border-2 border-solid ${dotColor}`}
      ></div>
      <span className="text-lg  font-semibold text-gray-100">
        {columnKey}
      </span>
    </Badge>
  );
};

export default KanbanColumnBadge;
