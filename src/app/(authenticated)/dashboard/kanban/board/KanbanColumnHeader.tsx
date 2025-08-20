import React from "react";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import KanbanColumnBadge from "./KanbanColumnBadge";
import { Status } from "@/store/useKanbanStore";
import { cn } from "@/lib/utils";

interface KanbanColumnHeaderProps {
  status: Status;
  isDark: boolean;
  columnIndex: number;
  onCreateTask: (status: Status, columnIndex: number) => void;
  count?: number;
  isDisabled?: boolean;
}

const KanbanColumnHeader = ({
  status,
  isDark,
  columnIndex,
  onCreateTask,
  count,
  isDisabled = false,
}: KanbanColumnHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="min-w-0">
        <KanbanColumnBadge columnKey={status} isDark={isDark} count={count} />
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => !isDisabled && onCreateTask(status, columnIndex)}
        disabled={isDisabled}
        className={cn(
          "w-8 h-8 shrink-0 rounded transition-all duration-200",
          isDisabled
            ? "bg-gray-300 text-gray-400 border-gray-300 cursor-not-allowed opacity-50"
            : "bg-[var(--item-bg)] hover:bg-[var(--hover-bg)] text-[var(--text-base)] border-[var(--border)] hover:border-[var(--border)] cursor-pointer"
        )}
      >
        <FaPlus />
      </Button>
    </div>
  );
};

export default React.memo(KanbanColumnHeader);
