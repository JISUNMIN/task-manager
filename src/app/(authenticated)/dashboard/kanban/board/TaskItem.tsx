import React, { memo, useRef, useEffect } from "react";
import { Draggable } from "@hello-pangea/dnd";
import TextareaAutosize from "react-textarea-autosize";
import { ActionDropdownMenu } from "@/components/ui/extended/ActionDropdownMenu";
import { Trash } from "lucide-react";

interface TaskItemProps {
  columnKey: string;
  itemIndex: number;
  task: any;
  handleDeleteTask: (columnKey: any, index: number) => void;
  handleUpdateTask: (columnKey: any, value: string, index: number) => void;
  setFocusedInputKey: (key: string) => void;
  setTaskInfoPanelrOpen: (open: boolean) => void;
  inputRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}

const TaskItem = memo(
  ({
    columnKey,
    itemIndex,
    task,
    handleDeleteTask,
    handleUpdateTask,
    setFocusedInputKey,
    setTaskInfoPanelrOpen,
    inputRefs,
  }: TaskItemProps) => {
    const items = [
      {
        label: "삭제",
        icon: <Trash />,
        variant: "destructive" as const,
        onSelect: () => handleDeleteTask(columnKey as any, itemIndex),
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
            className="bg-[var(--box-bg)] border rounded-lg p-3 cursor-pointer"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className="text-right">
              <ActionDropdownMenu items={items} />
            </div>

            <TextareaAutosize
              ref={(el) => {
                inputRefs.current[`${columnKey}-${itemIndex}`] = el;
              }}
              value={task.title}
              onChange={(e) =>
                handleUpdateTask(columnKey as any, e.target.value, itemIndex)
              }
              onFocus={() => setFocusedInputKey(`${columnKey}-${itemIndex}`)}
              onClick={() => setTaskInfoPanelrOpen(true)}
              placeholder="제목을 입력하세요"
              className="w-full p-2 border text-[var(--text-base)] rounded dark:focus:border-gray-300 dark:focus:outline-none"
            />
          </div>
        )}
      </Draggable>
    );
  },
  // props가 바뀐 경우만 리렌더링
  (prev, next) => {
    return prev.task === next.task; // 객체 레퍼런스가 같으면 리렌더링 방지
  }
);

export default TaskItem;
