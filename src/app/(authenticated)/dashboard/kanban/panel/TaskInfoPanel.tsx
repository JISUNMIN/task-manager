import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ALL_STATUS, ClientTask, Status, useKanbanStore } from "@/store/useKanbanStore";
import { TaskPriority } from "@prisma/client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import KanbanColumnBadge from "../board/KanbanColumnBadge";
import Editor, { EditorSaveStatus } from "@/components/shared/editor/Editor";
import Grid from "@/layout/Grid";
import { TbCircleDotted } from "react-icons/tb";
import { FaPeopleGroup } from "react-icons/fa6";
import { useMediaQuery } from "usehooks-ts";
import { debounce } from "lodash";
import { UserSelectInput } from "@/components/form/UserSelectInput";
import { Controller, useForm } from "react-hook-form";
import useTasks from "@/hooks/react-query/useTasks";
import { TaskComments } from "../taskcomment/TaskComments";
import { TaskActivityFeed } from "./TaskActivityFeed";
import { useThemeStore } from "@/store/useThemeStore";
import { SelectBox } from "@/components/shared/SelectBox";
import useUpload from "@/hooks/react-query/useUpload";
import { useSearchParams } from "next/navigation";
import {
  formatTaskDateForInput,
  formatTaskDueDate,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_OPTIONS,
} from "@/lib/utils/task";
import { CalendarDays } from "lucide-react";

interface TaskInfoPanelProps {
  isTaskInfoPanelOpen: boolean;
  closePanel: () => void;
  focusedTaskId: string | number | null;
  setFocusedTaskId: (taskId: string | number | null) => void;
  isPersonal?: boolean;
  panelWidth: number;
  setPanelWidth: (w: number) => void;
  inputRefs?: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}

type FormData = { assignees: number[] };

const TaskInfoPanel: React.FC<TaskInfoPanelProps> = ({
  isTaskInfoPanelOpen,
  closePanel,
  focusedTaskId,
  setFocusedTaskId,
  isPersonal,
  panelWidth,
  setPanelWidth,
  inputRefs,
}) => {
  const [localTitle, setLocalTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus>("idle");
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const { updateTask, columns, moveTask } = useKanbanStore();
  const { updateTaskMutate, moveTaskMutate } = useTasks();

  const resizing = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? undefined;
  const taskLocation = useMemo(() => {
    if (focusedTaskId == null) return null;

    const entries = Object.entries(columns) as [Status, ClientTask[]][];
    for (const [status, tasks] of entries) {
      const itemIndex = tasks.findIndex((candidate) => String(candidate.id) === String(focusedTaskId));
      if (itemIndex >= 0) {
        return {
          columnKey: status,
          taskIndex: itemIndex,
          task: tasks[itemIndex],
        };
      }
    }

    return null;
  }, [columns, focusedTaskId]);
  const columnKey = taskLocation?.columnKey;
  const taskIndex = taskLocation?.taskIndex ?? -1;
  const task = taskLocation?.task;
  const currentTaskId = task?.id ?? null;
  const currentTaskTitle = task?.title ?? "";
  const currentTaskDesc = task?.desc ?? "";
  const currentTaskPriority = task?.priority ?? "MEDIUM";
  const currentTaskDueDate = task?.dueDate ? String(task.dueDate) : null;
  const currentTaskAssignees = useMemo(() => task?.assignees ?? [], [task?.assignees]);
  const { upload } = useUpload(task?.id);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousTaskIdRef = useRef<string | number | null>(null);

  const { control, setValue } = useForm<FormData>({
    defaultValues: { assignees: [] },
  });

  const markSaving = useCallback(() => {
    if (saveStatusTimerRef.current) {
      clearTimeout(saveStatusTimerRef.current);
    }
    setSaveStatus("saving");
  }, []);

  const markSaved = useCallback(() => {
    if (saveStatusTimerRef.current) {
      clearTimeout(saveStatusTimerRef.current);
    }
    setSaveStatus("saved");
    saveStatusTimerRef.current = setTimeout(() => setSaveStatus("idle"), 1800);
  }, []);

  const markSaveError = useCallback(() => {
    if (saveStatusTimerRef.current) {
      clearTimeout(saveStatusTimerRef.current);
    }
    setSaveStatus("error");
  }, []);

  const debouncedUpdateTitle = useMemo(
    () =>
      debounce((taskId: number, value: string) => {
        updateTaskMutate(
          { id: taskId, title: value },
          {
            onSuccess: markSaved,
            onError: markSaveError,
          },
        );
      }, 500),
    [markSaveError, markSaved, updateTaskMutate],
  );

  const debouncedUpdateDesc = useMemo(
    () =>
      debounce((taskId: number, value: string) => {
        updateTaskMutate(
          { id: taskId, desc: value },
          {
            onSuccess: markSaved,
            onError: markSaveError,
          },
        );
      }, 500),
    [markSaveError, markSaved, updateTaskMutate],
  );

  const debouncedUpdateAssignees = useMemo(
    () =>
      debounce((taskId: number, assignees: number[]) => {
        updateTaskMutate(
          { id: taskId, assignees },
          {
            onSuccess: markSaved,
            onError: markSaveError,
          },
        );
      }, 500),
    [markSaveError, markSaved, updateTaskMutate],
  );

  const debouncedUpdateMeta = useMemo(
    () =>
      debounce((taskId: number, payload: { priority?: TaskPriority; dueDate?: string | null }) => {
        updateTaskMutate(
          { id: taskId, ...payload },
          {
            onSuccess: markSaved,
            onError: markSaveError,
          },
        );
      }, 500),
    [markSaveError, markSaved, updateTaskMutate],
  );

  const saveStatusLabel =
    saveStatus === "saving"
      ? "저장 중..."
      : saveStatus === "saved"
        ? "저장됨"
        : saveStatus === "error"
          ? "저장 실패"
          : "편집 중";

  const handleUpdateTask = useCallback((
    e: React.ChangeEvent<HTMLTextAreaElement> | string,
    target: "title" | "desc",
  ) => {
    const value = typeof e === "string" ? e : e.target.value;
    if (!task || !columnKey || taskIndex < 0 || typeof task.id !== "number") return;

    if (target === "title") {
      setLocalTitle(value);
      updateTask(columnKey, taskIndex, { title: value });
      markSaving();
      debouncedUpdateTitle(task.id, value);
    } else {
      markSaving();
      debouncedUpdateDesc(task.id, value);
    }
  }, [
    columnKey,
    debouncedUpdateDesc,
    debouncedUpdateTitle,
    markSaving,
    task,
    taskIndex,
    updateTask,
  ]);

  const handleUpdateStatus = (newStatus: Status) => {
    if (!task || !columnKey || taskIndex < 0) return;
    if (columnKey === newStatus) return;

    // 1️ 프론트에서 order 계산
    const tempTasks = [...columns[newStatus]];
    tempTasks.splice(0, 0, task);

    let nextTask: typeof task | null = null;

    // 맨 위
    nextTask = tempTasks[1] ?? null;

    const nextOrder = nextTask?.order ?? 0;
    const newOrder = nextOrder - 1;

    //  프론트 상태 업데이트 (order 반영)
    moveTask(columnKey, newStatus, taskIndex, 0, newOrder);

    //  서버 업데이트 호출
    if (typeof task.id === "number") {
      markSaving();
      moveTaskMutate({
        id: task.id,
        projectId: Number(projectId),
        toColumn: newStatus,
        newOrder,
      }, {
        onSuccess: markSaved,
        onError: markSaveError,
      });
    }

    setFocusedTaskId(task.id);
  };

  const handleUpdatePriority = (newPriority: TaskPriority) => {
    if (!task || !columnKey || taskIndex < 0 || typeof task.id !== "number") return;

    updateTask(columnKey, taskIndex, { priority: newPriority });
    markSaving();
    debouncedUpdateMeta(task.id, { priority: newPriority });
  };

  const handleUpdateDueDate = (newDueDate: string) => {
    if (!task || !columnKey || taskIndex < 0 || typeof task.id !== "number") return;

    const nextValue = newDueDate || null;
    updateTask(columnKey, taskIndex, { dueDate: nextValue });
    markSaving();
    debouncedUpdateMeta(task.id, { dueDate: nextValue });
  };

  useEffect(() => {
    if (currentTaskId == null) {
      previousTaskIdRef.current = null;
      setLocalTitle("");
      setSaveStatus("idle");
      return;
    }

    if (previousTaskIdRef.current === currentTaskId) {
      if (localTitle !== currentTaskTitle) {
        setLocalTitle(currentTaskTitle);
      }
      return;
    }

    previousTaskIdRef.current = currentTaskId;
    setLocalTitle(currentTaskTitle);
    setSaveStatus("idle");
  }, [currentTaskId, currentTaskTitle, localTitle]);

  useEffect(() => {
    setValue("assignees", currentTaskAssignees);
  }, [currentTaskAssignees, currentTaskId, setValue]);

  useEffect(() => {
    return () => {
      if (saveStatusTimerRef.current) {
        clearTimeout(saveStatusTimerRef.current);
      }
      debouncedUpdateTitle.cancel();
      debouncedUpdateDesc.cancel();
      debouncedUpdateAssignees.cancel();
      debouncedUpdateMeta.cancel();
    };
  }, [debouncedUpdateAssignees, debouncedUpdateDesc, debouncedUpdateMeta, debouncedUpdateTitle]);

  // 패널 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resizing.current) return;
      const target = event.target as HTMLElement;

      if (target.closest("[data-ignore-panel-outside]")) return;

      if (
        panelRef.current?.contains(target) ||
        Object.values(inputRefs?.current ?? {}).some((el) => el?.contains(target))
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
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizing.current) return;
      setPanelWidth(Math.min(Math.max(window.innerWidth - e.clientX, 400), 800));
    },
    [setPanelWidth]
  );
  const handleMouseUp = useCallback(() => {
    resizing.current = false;
  }, []);
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const panelFieldClassName =
    "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-500 dark:text-gray-100 dark:hover:border-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-900/40";
  const selectedDueDate = currentTaskDueDate ? new Date(currentTaskDueDate) : undefined;

  const handleQuickDueDate = (daysToAdd: number) => {
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    handleUpdateDueDate(formatTaskDateForInput(baseDate));
  };

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

      <Button variant="ghost" size="icon" onClick={closePanel} className="text-gray-600 ml-2 mt-2">
        <FaAngleDoubleRight className="w-6 h-6" />
      </Button>

      <div className="pl-2 sm:pl-4">
        <TextareaAutosize
          maxRows={2}
          className="w-full resize-none rounded-md border border-transparent bg-transparent p-2 text-sm sm:text-base focus:border-slate-300 focus:outline-none dark:focus:border-gray-600"
          style={{ fontSize: 16 }}
          placeholder="제목을 입력하세요"
          onChange={(e) => handleUpdateTask(e, "title")}
          value={localTitle}
        />

        <Grid className="grid grid-cols-1 sm:grid-cols-[110px_minmax(0,1fr)] gap-x-4 gap-y-3 px-2 sm:px-5">
          <div className="flex items-center gap-1 whitespace-nowrap">
            <TbCircleDotted className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">상태</span>
          </div>
          <SelectBox
            options={ALL_STATUS}
            value={columnKey ?? ALL_STATUS[0]}
            onChange={handleUpdateStatus}
            renderOption={(status) => <KanbanColumnBadge columnKey={status} isDark={isDark} />}
            className="max-w-none"
          />

          <div className="flex items-center gap-1 whitespace-nowrap">
            <TbCircleDotted className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">우선순위</span>
          </div>
          <SelectBox
            options={TASK_PRIORITY_OPTIONS}
            value={currentTaskPriority}
            onChange={handleUpdatePriority}
            renderOption={(priority) => TASK_PRIORITY_LABELS[priority]}
            className="max-w-none"
          />

          <div className="flex items-center gap-1 whitespace-nowrap">
            <TbCircleDotted className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">마감일</span>
          </div>
          <div className="flex flex-col gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  data-ignore-panel-outside
                  className={`${panelFieldClassName} flex items-center justify-between`}
                >
                  <span className={currentTaskDueDate ? "" : "text-gray-400"}>
                    {currentTaskDueDate ? formatTaskDueDate(currentTaskDueDate) : "마감일 선택"}
                  </span>
                  <CalendarDays className="h-4 w-4 text-[var(--text-blur)]" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                data-ignore-panel-outside
                className="w-auto rounded-2xl border border-[var(--border)] p-3"
              >
                <div data-ignore-panel-outside className="mb-3 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => handleQuickDueDate(0)}>
                    오늘
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleQuickDueDate(1)}>
                    내일
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleQuickDueDate(3)}>
                    3일 뒤
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleQuickDueDate(7)}>
                    1주일 뒤
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => handleUpdateDueDate("")}>
                    지우기
                  </Button>
                </div>
                <div data-ignore-panel-outside>
                  <Calendar
                    mode="single"
                    selected={selectedDueDate}
                    onSelect={(date) => handleUpdateDueDate(date ? formatTaskDateForInput(date) : "")}
                    captionLayout="dropdown"
                  />
                </div>
              </PopoverContent>
            </Popover>
            <span className="text-xs text-[var(--text-blur)]">
              {currentTaskDueDate ? `선택된 마감일: ${formatTaskDueDate(currentTaskDueDate)}` : "마감일 없음"}
            </span>
          </div>

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
                      if (!task || !columnKey || taskIndex < 0 || typeof task.id !== "number") return;

                      updateTask(columnKey, taskIndex, {
                        assignees: newAssignees,
                      });
                      markSaving();
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

      <div className="p-2 sm:p-4 mb-14 flex flex-col overflow-y-auto h-full">
        {typeof task?.id === "number" && <TaskActivityFeed taskId={task.id} />}
        {typeof task?.id === "number" && <TaskComments taskId={task.id} />}
        <div className="mb-3 flex justify-end">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              saveStatus === "error"
                ? "bg-red-100 text-red-700"
                : saveStatus === "saved"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-[var(--btn-hover-bg)] text-[var(--text-base)]"
            }`}
          >
            {saveStatusLabel}
          </span>
        </div>
        <Editor
          key={String(currentTaskId ?? "empty-task")}
          onChange={(e) => handleUpdateTask(e, "desc")}
          content={currentTaskDesc}
          upload={upload}
        />
      </div>
    </div>
  );
};

export default React.memo(TaskInfoPanel);
