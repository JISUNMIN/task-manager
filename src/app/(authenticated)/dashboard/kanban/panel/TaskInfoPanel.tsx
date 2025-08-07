import { Button } from "@/components/ui/button";
import { ResizablePanel } from "@/components/ui/resizable";
import { ALL_STATUS, Status, useKanbanStore } from "@/store/useKanbanStore";
import React, { useEffect, useMemo } from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import KanbanColumnBadge from "../board/KanbanColumnBadge";
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
import { TaskComments } from "../taskcomment/TaskComments";
import { useThemeStore } from "@/store/useThemeStore";

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
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const { updateTask, columns, moveTask } = useKanbanStore();
  const { updateTaskMutate, moveTaskMutate } = useTasks();

  const [columnKey, itemIndexStr] = focusedInputKey.split("-");
  const taskIndex = Number(itemIndexStr);

  // columns 값이 바뀌어도, taskIndex/columnKey가 같으면 memoization으로 task만 가져옴
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
    moveTaskMutate({
      id: task?.id,
      toColumn: newStatus,
      toIndex: 0,
    });
  };

  useEffect(() => {
    if (task && task.assignees) {
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
      className={`min-h-screen bg-[var(--bg-third)] transition-transform transform  ${
        isTaskInfoPanelOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
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
        <Grid className="grid grid-cols-1 sm:grid-cols-[1fr_6fr] gap-y-3 px-5">
          <div className="flex items-center gap-1 whitespace-nowrap">
            <TbCircleDotted />
            <span className="text-sm sm:text-base text-gray-700">상태</span>
          </div>

          <Select
            value={columnKey}
            onValueChange={(newStatus: Status) => handleUpdateStatus(newStatus)}
          >
            <SelectTrigger className="w-full py-6">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  <KanbanColumnBadge columnKey={status} isDark={isDark} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isPersonal && (
            <>
              <div className="flex items-center gap-1">
                <FaPeopleGroup />
                <span className="text-sm sm:text-base text-gray-700">
                  할당자
                </span>
              </div>

              <Controller
                name="assignees"
                control={control}
                render={({ field }) => (
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
                )}
              />
            </>
          )}
        </Grid>
      </div>
      <div className="p-4 h-full flex flex-col overflow-y-auto">
        <TaskComments taskId={task?.id} />
        <Editor
          onChange={(e) => handleUpdateTask(e, "desc")}
          content={task?.desc}
        />
      </div>
    </ResizablePanel>
  );
};

export default React.memo(TaskInfoPanel);
