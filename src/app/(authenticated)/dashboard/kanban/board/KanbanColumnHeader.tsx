import React from "react";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import KanbanColumnBadge from "./KanbanColumnBadge";
import { Status } from "@/store/useKanbanStore";

interface KanbanColumnHeaderProps {
  status: Status;
  isDark: boolean;
  columnIndex: number;
  onCreateTask: (status: Status, columnIndex: number) => void;
  count?: number;
}

const KanbanColumnHeader = ({
  status,
  isDark,
  columnIndex,
  onCreateTask,
  count,
}: KanbanColumnHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="min-w-0">
        <KanbanColumnBadge
          columnKey={status}
          isDark={isDark}
          count={count}
        />
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onCreateTask(status, columnIndex)}
           className="w-8 h-8 shrink-0 bg-[var(--item-bg)] hover:bg-[var(--hover-bg)] text-[var(--text-base)] border-[var(--border)] hover:border-[var(--border)] rounded"
      >
        <FaPlus />
      </Button>
    </div>
  );
};

export default React.memo(KanbanColumnHeader);
