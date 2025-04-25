import { Button } from "@/components/ui/button";
import { ResizablePanel } from "@/components/ui/resizable";
import { ALL_STATUS, status, useKanbanStore } from "@/store/useKanbanStore";
import React, { useCallback } from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import KanbanColumnBadge from "./KanbanColumnBadge";
import Editor from "@/components/ui/editor/Editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Grid from "@/layout/Grid";

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
  const { updateTask, columns, moveTask } = useKanbanStore();
  const [columnKey, itemIndexStr] = focusedInputKey.split("-");
  const taskIndex = Number(itemIndexStr);

  const onChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      updateTask(columnKey as status, Number(itemIndexStr), { title: value });
    },
    [focusedInputKey]
  );

  const onChangeDesc = useCallback(
    (value: string) => {
      updateTask(columnKey as status, Number(itemIndexStr), { desc: value });
    },
    [columnKey, itemIndexStr]
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
        <Grid className="grid grid-cols-[1fr_1fr] gap-y-10">
          <span>상태</span>
          <Select
            value={columnKey}
            onValueChange={(newStatus) => {
              moveTask(columnKey as status, newStatus as status, taskIndex);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  <KanbanColumnBadge columnKey={status} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Grid>
      </div>
      <div className=" p-4 h-full flex flex-col overflow-y-auto ">
        <TextareaAutosize
          className="w-full rounded border p-2 resize-none"
          placeholder="추가할 작업을 입력하세요"
          onChange={onChangeTitle}
          value={columns[columnKey as status][Number(itemIndexStr)]?.title}
        />
        <div className="bg-amber-200">
          <Editor
            onChange={onChangeDesc}
            content={columns[columnKey as status][Number(itemIndexStr)]?.desc}
          />
        </div>
      </div>
    </ResizablePanel>
  );
};

export default TaskInfoPanel;
