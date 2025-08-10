import { Button } from "@/components/ui/button";
import { ALL_STATUS, Status, useKanbanStore } from "@/store/useKanbanStore";
import React, { useEffect, useMemo, useRef } from "react";
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
  closePanel: () => void;
  focusedInputKey: string;
  handleFocusedInputKey: (columnKey: string, itemIndex: number) => void;
  isPersonal?: boolean;
  panelWidth: number;
  setPanelWidth: (w: number) => void;
  inputRefs?: React.MutableRefObject<
    Record<string, HTMLTextAreaElement | null>
  >;
}

type FormData = {
  assignees: number[];
};

const TaskInfoPanel: React.FC<TaskInfoPanelProps> = ({
  isTaskInfoPanelOpen,
  closePanel,
  focusedInputKey,
  handleFocusedInputKey,
  isPersonal,
  panelWidth,
  setPanelWidth,
  inputRefs,
}) => {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const { updateTask, columns, moveTask } = useKanbanStore();
  const { updateTaskMutate, moveTaskMutate } = useTasks();

  const [columnKey, itemIndexStr] = focusedInputKey.split("-");
  const taskIndex = Number(itemIndexStr);
  const resizing = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const task = useMemo(
    () => columns[columnKey as Status]?.[taskIndex],
    [columns, columnKey, taskIndex]
  );

  const isMobile = useMediaQuery("(max-width: 767px)");

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
    updateTask(columnKey as Status, taskIndex, { [target]: value });

    if (target === "title") debouncedUpdateTitle(task.id, value);
    else debouncedUpdateDesc(task.id, value);
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

  // 패널 외부 클릭 시 닫기 (드래그 중이면 제외, 그리고 TaskItem input 클릭 시 제외)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resizing.current) return;

      const target = event.target as Node;

      if (
        panelRef.current?.contains(target) ||
        // inputRefs 내 ref 중 클릭 대상 포함 여부 체크
        Object.values(inputRefs?.current ?? {}).some(
          (el) => el && el.contains(target)
        )
      ) {
        // 패널 내부 또는 input 클릭 시 닫지 않음
        return;
      }

      closePanel();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closePanel, inputRefs]);

  // 패널 resize 핸들
  const handleMouseDown = (e: React.MouseEvent) => {
    resizing.current = true;
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    setPanelWidth(Math.min(Math.max(newWidth, 400), 800));
  };

  const handleMouseUp = () => {
    resizing.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      className={`
    fixed top-14 right-0 h-full flex flex-col z-50
    bg-[var(--bg-third)] shadow-[ -2px_0_6px_rgba(0,0,0,0.15)]
    transition-transform duration-300 ease-in-out
    ${isTaskInfoPanelOpen ? "translate-x-0" : "translate-x-full"}
  `}
      style={{
        width: isMobile ? "100%" : `${panelWidth}px`,
      }}
    >
      {/* resize 핸들 */}
      <div
        className="absolute top-0 bottom-0 -left-[6px] w-[6px] cursor-col-resize z-[60]"
        onMouseDown={handleMouseDown}
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={closePanel}
        className="text-gray-600 ml-2 mt-2"
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
            <span className="text-sm sm:text-base">상태</span>
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
              <div className="flex items-center gap-1 whitespace-nowrap">
                <FaPeopleGroup />
                <span className="text-sm sm:text-base">할당자</span>
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
    </div>
  );
};

export default React.memo(TaskInfoPanel);
