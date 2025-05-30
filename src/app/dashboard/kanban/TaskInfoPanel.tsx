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
import { TbCircleDotted } from "react-icons/tb";
import { useMediaQuery } from "usehooks-ts";

interface TaskInfoPanelProps {
  isTaskInfoPanelOpen: boolean;
  togglePanel: () => void;
  focusedInputKey: string;
  handleFocusedInputKey: (columnKey: string, itemIndex: number) => void;
}

const TaskInfoPanel: React.FC<TaskInfoPanelProps> = ({
  isTaskInfoPanelOpen,
  togglePanel,
  focusedInputKey,
  handleFocusedInputKey,
}) => {
  const { updateTask, columns, moveTask } = useKanbanStore();
  const [columnKey, itemIndexStr] = focusedInputKey.split("-");
  const taskIndex = Number(itemIndexStr);
  const isMobile = useMediaQuery("(max-width: 768px)");

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
      minSize={isTaskInfoPanelOpen ? (isMobile ? 100 : 30) : 0}
      maxSize={isTaskInfoPanelOpen ? (isMobile ? 100 : 50) : 0}
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
        <TextareaAutosize
          style={{ fontSize: "20px" }}
          maxRows={2}
          className="w-full p-2 resize-none"
          placeholder="제목을 입력하세요"
          onChange={onChangeTitle}
          value={columns[columnKey as status][Number(itemIndexStr)]?.title}
        />
        <Grid className="grid grid-cols-[1fr_6fr] gap-y-10">
          <div className="flex items-center">
            <TbCircleDotted />
            <span className="text-gray-700">Status</span>
          </div>
          <Select
            value={columnKey}
            onValueChange={(newStatus) => {
              moveTask(columnKey as status, newStatus as status, taskIndex, 0);
              handleFocusedInputKey(newStatus, taskIndex);
            }}
          >
            <SelectTrigger className="pt-5 pb-5 ">
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
        <div>
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
