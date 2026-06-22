import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import TextareaAutosize from "react-textarea-autosize";
import { ActionDropdownMenu } from "@/components/ui/extended/ActionDropdownMenu";
import { Trash } from "lucide-react";
import { ClientTask, Status } from "@/store/useKanbanStore";
import {
  formatTaskDueDate,
  getTaskDueStatus,
  getTaskDueStatusLabel,
  TASK_PRIORITY_LABELS,
} from "@/lib/utils/task";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  columnKey: Status;
  itemIndex: number;
  task: ClientTask;
  handleDeleteTask: (columnKey: Status, index: number) => void;
  handleUpdateTask: (columnKey: Status, value: string, index: number) => void;
  setFocusedInputKey: (key: string) => void;
  openPanel: () => void;
  inputRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}

const TaskItem = ({
  columnKey,
  itemIndex,
  task,
  handleDeleteTask,
  handleUpdateTask,
  setFocusedInputKey,
  openPanel,
  inputRefs,
}: TaskItemProps) => {
  const dueStatus = getTaskDueStatus(task.dueDate);

  const items = [
    {
      label: "삭제",
      icon: <Trash />,
      variant: "destructive" as const,
      onSelect: () => handleDeleteTask(columnKey, itemIndex),
    },
  ];

  return (
    <Draggable
      key={`${columnKey}-${itemIndex}`}
      draggableId={`${columnKey}-${itemIndex}`}
      index={itemIndex}
    >
      {(provided) => (
        <div
          className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--box-bg)] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="text-right">
            <ActionDropdownMenu items={items} modal={false} />
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-5",
                task.priority === "HIGH" && "bg-rose-100 text-rose-700",
                task.priority === "MEDIUM" && "bg-amber-100 text-amber-700",
                task.priority === "LOW" && "bg-emerald-100 text-emerald-700",
              )}
            >
              {TASK_PRIORITY_LABELS[task.priority ?? "MEDIUM"]}
            </span>
            {task.dueDate && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-5",
                  dueStatus === "overdue" && "bg-red-100 text-red-700",
                  dueStatus === "today" && "bg-orange-100 text-orange-700",
                  dueStatus === "soon" && "bg-yellow-100 text-yellow-700",
                  dueStatus === "normal" && "bg-slate-100 text-slate-700",
                )}
              >
                {getTaskDueStatusLabel(task.dueDate)}
              </span>
            )}
          </div>
          <TextareaAutosize
            ref={(el) => {
              inputRefs.current[`${columnKey}-${itemIndex}`] = el;
            }}
            value={task.title}
            onChange={(e) => handleUpdateTask(columnKey, e.target.value, itemIndex)}
            onFocus={() => setFocusedInputKey(`${columnKey}-${itemIndex}`)}
            onClick={openPanel}
            placeholder="제목을 입력하세요"
            className="w-full rounded border p-2 font-semibold text-[var(--text-base)] dark:border-gray-600 dark:focus:border-gray-300 dark:focus:outline-none"
          />
          {task.dueDate && (
            <p className="mt-1 text-[11px] text-[var(--text-blur)]">
              마감일 {formatTaskDueDate(task.dueDate)}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default React.memo(TaskItem, (prev, next) => prev.task === next.task);
