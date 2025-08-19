import { Button } from "@/components/ui/button";
import { ALL_STATUS, Status, useKanbanStore } from "@/store/useKanbanStore";
import React, { useEffect, useMemo, useRef } from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import KanbanColumnBadge from "../board/KanbanColumnBadge";
import Editor from "@/components/shared/editor/Editor";
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
import { SelectBox } from "@/components/shared/SelectBox";
import useUpload from "@/hooks/react-query/useUpload";

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

type FormData = { assignees: number[] };

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
  const { upload } = useUpload(task?.id);

  const isMobile = useMediaQuery("(max-width: 767px)");

  const { control, setValue } = useForm<FormData>({
    defaultValues: { assignees: [] },
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
    target === "title"
      ? debouncedUpdateTitle(task.id, value)
      : debouncedUpdateDesc(task.id, value);
  };

  const handleUpdateStatus = (newStatus: Status) => {
    // 1️⃣ 프론트에서 order 계산
    const destTasks = [...columns[newStatus]];
    const tempTasks = [...destTasks];
    tempTasks.splice(0, 0, task);

    let prevTask: typeof task | null = null;
    let nextTask: typeof task | null = null;

    // 맨 위
    // prevTask = null;
    nextTask = tempTasks[1] ?? null;

    // const prevOrder = prevTask?.order ?? 0;
    // console.log("🚀 ~ handleDragEnd ~ prevOrder:", prevOrder);
    const nextOrder = nextTask?.order ?? 0;
    console.log("🚀 ~ handleDragEnd ~ nextOrder:", nextOrder);

    const newOrder = nextOrder - 1;

    // 2️⃣ 프론트 상태 업데이트 (order 반영)
    moveTask(columnKey as Status, newStatus as Status, taskIndex, 0, newOrder);

    // 3️⃣ 서버에 단일 업데이트 호출
    moveTaskMutate({
      id: task.id,
      toColumn: newStatus,
      newOrder,
    });

    // moveTask(columnKey as Status, newStatus as Status, taskIndex, 0,0);
    // moveTaskMutate({ id: task?.id, toColumn: newStatus, toIndex: 0 });
    handleFocusedInputKey(newStatus, taskIndex);
  };

  useEffect(() => {
    if (task?.assignees) {
      const ids = task.assignees.map((a: any) =>
        typeof a === "number" ? a : a.id
      );
      setValue("assignees", ids);
    } else setValue("assignees", []);
  }, [task, setValue]);

  // 패널 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resizing.current) return;
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        Object.values(inputRefs?.current ?? {}).some((el) =>
          el?.contains(target)
        )
      )
        return;
      closePanel();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closePanel, inputRefs]);

  // 패널 resize 핸들
  const handleMouseDown = (e: React.MouseEvent) => {
    resizing.current = true;
    e.preventDefault();
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing.current) return;
    setPanelWidth(Math.min(Math.max(window.innerWidth - e.clientX, 400), 800));
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
        bg-[var(--bg-third)] shadow-[-2px_0_6px_rgba(0,0,0,0.15)]
        transition-transform duration-300 ease-in-out
        ${isTaskInfoPanelOpen ? "translate-x-0" : "translate-x-full"}
      `}
      style={{ width: isMobile ? "100%" : `${panelWidth}px` }}
    >
      {!isMobile && (
        <div
          className="absolute top-0 bottom-0 -left-[6px] w-[6px] cursor-col-resize z-[60]"
          onMouseDown={handleMouseDown}
        />
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={closePanel}
        className="text-gray-600 ml-2 mt-2"
      >
        <FaAngleDoubleRight className="w-6 h-6" />
      </Button>

      <div className="pl-2 sm:pl-4">
        <TextareaAutosize
          maxRows={2}
          className="w-full p-2 resize-none text-sm sm:text-base"
          style={{ fontSize: 16 }}
          placeholder="제목을 입력하세요"
          onChange={(e) => handleUpdateTask(e, "title")}
          value={task?.title}
        />

        <Grid className="grid grid-cols-1 sm:grid-cols-[1fr_6fr] gap-y-3 px-2 sm:px-5">
          <div className="flex items-center gap-1 whitespace-nowrap">
            <TbCircleDotted className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">상태</span>
          </div>
          <SelectBox
            options={ALL_STATUS}
            value={columnKey as Status}
            onChange={handleUpdateStatus}
            renderOption={(status) => (
              <KanbanColumnBadge columnKey={status} isDark={isDark} />
            )}
          />

          {!isPersonal && (
            <>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <FaPeopleGroup className="w-4 h-4 sm:w-5 sm:h-5" />
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

      <div className="p-2 sm:p-4 h-full flex flex-col overflow-y-auto">
        <TaskComments taskId={task?.id} />
        <Editor
          onChange={(e) => handleUpdateTask(e, "desc")}
          content={task?.desc}
          upload={upload}
        />
      </div>
    </div>
  );
};

export default React.memo(TaskInfoPanel);
