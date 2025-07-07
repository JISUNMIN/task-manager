import { Button } from "@/components/ui/button";
import { ResizablePanel } from "@/components/ui/resizable";
import { ALL_STATUS, Status, useKanbanStore } from "@/store/useKanbanStore";
import React, { useMemo, useState } from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import KanbanColumnBadge from "./KanbanColumnBadge";
import Editor from "@/components/shared/editor/Editor";
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
import useProjects from "@/hooks/react-query/useProjects";
import { UserSelectInput } from "@/components/form/UserSelectInput";
import { Controller, useForm, useWatch } from "react-hook-form";

interface TaskInfoPanelProps {
  isTaskInfoPanelOpen: boolean;
  togglePanel: () => void;
  focusedInputKey: string;
  handleFocusedInputKey: (columnKey: string, itemIndex: number) => void;
  isPersonal?: boolean;
}

const TaskInfoPanel: React.FC<TaskInfoPanelProps> = ({
  isTaskInfoPanelOpen,
  togglePanel,
  focusedInputKey,
  handleFocusedInputKey,
  isPersonal,
}) => {
  const { updateTask, columns, moveTask } = useKanbanStore();
  const { updateTaskMutate } = useProjects();
  const [columnKey, itemIndexStr] = focusedInputKey.split("-");
  const taskIndex = Number(itemIndexStr);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { control, watch } = useForm();
  const assigneeIds = useWatch({
    control: control,
    name: "assignees",
  });

  const debouncedUpdate = useMemo(
    () =>
      debounce((taskId: number, value: string | number[], target: string) => {
        if (target === "title") {
          updateTaskMutate({ id: taskId, title: value });
        } else if (target === "desc") {
          updateTaskMutate({ id: taskId, assignees: value });
        } else {
          updateTaskMutate({ id: taskId, desc: value });
        }
      }, 1500),
    []
  );

  const handleUpdateTask = (
    e: React.ChangeEvent<HTMLTextAreaElement> | string,
    target: string
  ) => {
    const value = typeof e === "string" ? e : e.target.value;
    const task = columns[columnKey as Status][taskIndex];

    // 로컬 상태
    if (target === "title") {
      updateTask(columnKey as Status, taskIndex, { title: value });
    } else if (target === "desc") {
      updateTask(columnKey as Status, taskIndex, { desc: value });
    } else if (target === "assignees") {
      // 예: value가 number[]인 경우
      updateTask(columnKey as Status, taskIndex, {
        assignees: assigneeIds as number[],
      });
    }
    // API 요청 debounce 처리
    if (target === "assignees") {
      debouncedUpdate(task.id, assigneeIds, target);
    } else {
      debouncedUpdate(task.id, value, target);
    }
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
          onChange={(e) => handleUpdateTask(e, "title")}
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

          {!isPersonal && (
            <>
              <div className="flex items-center">
                <FaPeopleGroup />
                <span className="text-gray-700 ml-1"> 할당자</span>
              </div>
              <Controller
                name="assignees"
                control={control}
                render={({ field }) => (
                  <UserSelectInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="사용자 검색"
                  />
                )}
              />
            </>
          )}
        </Grid>
      </div>
      <div className=" p-4 h-full flex flex-col overflow-y-auto ">
        <div>
          <Editor
            onChange={(e) => handleUpdateTask(e, "desc")}
            content={columns[columnKey as Status][Number(itemIndexStr)]?.desc}
          />
        </div>
      </div>
    </ResizablePanel>
  );
};

export default TaskInfoPanel;
