import { Button } from "@/components/ui/button";
import { ResizablePanel } from "@/components/ui/resizable";
import { ALL_STATUS, Status, useKanbanStore } from "@/store/useKanbanStore";
import React, { useEffect, useMemo } from "react";
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
import { UserSelectInput } from "@/components/form/UserSelectInput";
import { Controller, useForm } from "react-hook-form";
import useTasks from "@/hooks/react-query/useTasks";
import { TaskComments } from "./TaskComments";

interface TaskInfoPanelProps {
  isTaskInfoPanelOpen: boolean;
  togglePanel: () => void;
  focusedInputKey: string;
  handleFocusedInputKey: (columnKey: string, itemIndex: number) => void;
  isPersonal?: boolean;
}

type FormData = {
  assignees: number[];
};

const TaskInfoPanel: React.FC<TaskInfoPanelProps> = ({
  isTaskInfoPanelOpen,
  togglePanel,
  focusedInputKey,
  handleFocusedInputKey,
  isPersonal,
}) => {
  const { updateTask, columns, moveTask } = useKanbanStore();
  const { updateTaskMutate, updateTaskStatus } = useTasks();
  const [columnKey, itemIndexStr] = focusedInputKey.split("-");
  const taskIndex = Number(itemIndexStr);
  const task = useMemo(
    () => columns[columnKey as Status]?.[taskIndex],
    [columns, columnKey, taskIndex]
  );
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { control, setValue } = useForm<FormData>({
    defaultValues: {
      assignees: [],
    },
  });

  const debouncedUpdateTitle = useMemo(
    () =>
      debounce((taskId: number, value: string) => {
        updateTaskMutate({ id: taskId, title: value });
      }, 500),
    [updateTaskMutate]
  );

  const debouncedUpdateDesc = useMemo(
    () =>
      debounce((taskId: number, value: string) => {
        updateTaskMutate({ id: taskId, desc: value });
      }, 500),
    [updateTaskMutate]
  );

  const debouncedUpdateAssignees = useMemo(
    () =>
      debounce((taskId: number, assignees: number[]) => {
        updateTaskMutate({ id: taskId, assignees });
      }, 500),
    [updateTaskMutate]
  );

  const handleUpdateTask = (
    e: React.ChangeEvent<HTMLTextAreaElement> | string,
    target: "title" | "desc"
  ) => {
    const value = typeof e === "string" ? e : e.target.value;

    const updates: Partial<typeof task> = {
      [target]: value,
    };

    updateTask(columnKey as Status, taskIndex, updates);

    if (target === "title") {
      debouncedUpdateTitle(task.id, value);
    } else {
      debouncedUpdateDesc(task.id, value);
    }
  };

  const handleUpdateStatus = (newStatus: Status) => {
    moveTask(columnKey as Status, newStatus as Status, taskIndex, 0);
    handleFocusedInputKey(newStatus, taskIndex);
    updateTaskStatus({
      id: task?.id,
      status: newStatus,
    });
  };

  useEffect(() => {
    if (task && task.assignees) {
      // assignees가 객체 배열이면 ids로 변환
      const ids = (task.assignees as any[]).map((a) =>
        typeof a === "number" ? a : a.id
      );
      setValue("assignees", ids);
    } else {
      setValue("assignees", []);
    }
  }, [task, setValue]);

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
          value={task?.title}
        />
        <Grid className="grid grid-cols-[1fr_6fr] px-5">
          <div className="flex items-center">
            <TbCircleDotted />
            <span className="text-gray-700 ml-1"> 상태</span>
          </div>
          <Select
            value={columnKey}
            onValueChange={(newStatus: Status) => {
              handleUpdateStatus(newStatus);
            }}
          >
            <SelectTrigger className="w-full py-6">
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
                render={({ field }) => {
                  return (
                    <UserSelectInput
                      value={field.value ?? []}
                      onChange={(newAssignees) => {
                        field.onChange(newAssignees);
                        updateTask(columnKey as Status, taskIndex, {
                          assignees: newAssignees,
                        });
                        debouncedUpdateAssignees(task.id, newAssignees);
                      }}
                      placeholder="사용자 검색"
                    />
                  );
                }}
              />
            </>
          )}
        </Grid>
      </div>
      <div className=" p-4 h-full flex flex-col overflow-y-auto ">
        <TaskComments taskId={task?.id} />
        <Editor
          onChange={(e) => handleUpdateTask(e, "desc")}
          content={task?.desc}
        />
      </div>
    </ResizablePanel>
  );
};

export default TaskInfoPanel;
