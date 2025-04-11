import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResizablePanel } from "@/components/ui/resizable";
import { status, useKanbanStore } from "@/store/useKanbanStore";
import React, { useCallback } from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import KanbanColumnBadge from "./KanbanColumnBadge";
import TiptapEditor from "@/components/ui/editor/TiptapEditor";

<FaAngleDoubleRight className="w-6 h-6" />;

interface TaskInfoPanelProps {
  isTaskInfoPanelOpen: boolean;
  togglePanel: () => void;
  focusedInputKey: string;
}

const TaskInfoPanel: React.FC<TaskInfoPanelProps> = ({
  isTaskInfoPanelOpen,
  togglePanel,
  focusedInputKey,
}) => {
  const { updateTask, columns } = useKanbanStore();
  const [columnKey, itemIndexStr] = focusedInputKey.split("-");

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      updateTask(columnKey as status, Number(itemIndexStr), { title: value });
    },
    [focusedInputKey]
  );

  return (
    <ResizablePanel
      defaultSize={25}
      minSize={isTaskInfoPanelOpen ? 30 : 0}
      maxSize={!isTaskInfoPanelOpen ? 0 : 50}
      className={`min-h-screen bg-green-50 transition-transform transform  ${isTaskInfoPanelOpen ? "translate-x-0" : "translate-x-full"}  `}
    >
      {/* 닫기 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePanel}
        className="text-gray-600 ml-2"
      >
        <FaAngleDoubleRight className="w-6 h-6" />
      </Button>
      <div className="pl-4">
        <KanbanColumnBadge columnKey={columnKey as status} />
      </div>
      <div className=" p-4 h-full flex flex-col overflow-y-auto ">
        <TextareaAutosize
          className="w-full rounded border p-2 resize-none"
          placeholder="추가할 작업을 입력하세요"
          onChange={onChange}
          value={columns[columnKey as status][Number(itemIndexStr)].title}
        />
        <TiptapEditor />
      </div>
    </ResizablePanel>
  );
};

export default TaskInfoPanel;
