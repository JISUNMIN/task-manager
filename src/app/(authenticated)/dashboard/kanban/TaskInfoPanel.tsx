import { Button } from "@/components/ui/button";
import { ResizablePanel } from "@/components/ui/resizable";
import { ALL_STATUS, Status, useKanbanStore } from "@/store/useKanbanStore";
import React, { useCallback, useMemo } from "react";
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
import { FaPeopleGroup } from "react-icons/fa6";
import { useMediaQuery } from "usehooks-ts";
import { debounce } from "lodash";
import useProjects from "@/hooks/useProjects";

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
  const { updateMutate } = useProjects();
  const [columnKey, itemIndexStr] = focusedInputKey.split("-");
  const taskIndex = Number(itemIndexStr);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const onChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      updateTask(columnKey as Status, Number(itemIndexStr), { title: value });
    },
    [focusedInputKey]
  );

  const onChangeDesc = useCallback(
    (value: string) => {
      updateTask(columnKey as Status, Number(itemIndexStr), { desc: value });
    },
    [columnKey, itemIndexStr]
  );

  const debouncedUpdate = useMemo(
    () =>
      debounce((taskId: number, newTitle: string) => {
        updateMutate({ id: taskId, title: newTitle });
      }, 1500),
    []
  );
  const handleUpdateTask = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const task = columns[columnKey as Status][taskIndex];

    // 로컬 상태
    updateTask(columnKey as Status, taskIndex, { title: value });
    // API 요청 debounce 처리
    debouncedUpdate(task.id, value);
  };

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
          onChange={handleUpdateTask}
          value={columns[columnKey as Status][Number(itemIndexStr)]?.title}
        />
        <Grid className="grid grid-cols-[1fr_6fr] px-5">
          <div className="flex items-center">
            <TbCircleDotted />
            <span className="text-gray-700 ml-1"> 상태</span>
          </div>
          <Select
            value={columnKey}
            onValueChange={(newStatus) => {
              moveTask(columnKey as Status, newStatus as Status, taskIndex, 0);
              handleFocusedInputKey(newStatus, taskIndex);
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
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

          <div className="flex items-center">
            <FaPeopleGroup />
            <span className="text-gray-700 ml-1"> 할당자</span>
          </div>
          <Select
            value={columnKey}
            onValueChange={(newStatus) => {
              moveTask(columnKey as Status, newStatus as Status, taskIndex, 0);
              handleFocusedInputKey(newStatus, taskIndex);
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
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
            content={columns[columnKey as Status][Number(itemIndexStr)]?.desc}
          />
        </div>
      </div>
    </ResizablePanel>
  );
};

export default TaskInfoPanel;
