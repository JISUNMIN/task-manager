import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import TextareaAutosize from "react-textarea-autosize";
import { ActionDropdownMenu } from "@/components/ui/extended/ActionDropdownMenu";
import { Trash } from "lucide-react";
import { ClientTask, Status } from "@/store/useKanbanStore";

interface TaskItemProps {
  columnKey: Status;
  itemIndex: number;
  task: ClientTask;
  handleDeleteTask: (columnKey: Status, index: number) => void;
  handleUpdateTask: (columnKey: Status, value: string, index: number) => void;
  setFocusedTaskId: (taskId: string | number) => void;
  openPanel: () => void;
  inputRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}

const TaskItem = ({
  columnKey,
  itemIndex,
  task,
  handleDeleteTask,
  handleUpdateTask,
  setFocusedTaskId,
  openPanel,
  inputRefs,
}: TaskItemProps) => {
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
      key={String(task.id)}
      draggableId={String(task.id)}
      index={itemIndex}
    >
      {(provided) => (
        <div
          className="bg-[var(--box-bg)] border rounded-lg p-3 cursor-pointer"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="text-right">
            <ActionDropdownMenu items={items} modal={false} />
          </div>
          <TextareaAutosize
            ref={(el) => {
              inputRefs.current[String(task.id)] = el;
            }}
            value={task.title ?? ""}
            onChange={(e) => handleUpdateTask(columnKey, e.target.value, itemIndex)}
            onFocus={() => setFocusedTaskId(task.id)}
            onClick={openPanel}
            placeholder="제목을 입력하세요"
            className="w-full p-2 border text-[var(--text-base)] rounded dark:focus:border-gray-300 dark:focus:outline-none"
          />
        </div>
      )}
    </Draggable>
  );
};

export default React.memo(TaskItem, (prev, next) => prev.task === next.task);
