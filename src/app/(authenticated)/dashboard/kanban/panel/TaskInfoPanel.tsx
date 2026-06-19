import { Button } from "@/components/ui/button";
import { ALL_STATUS, ClientTask, Status, useKanbanStore } from "@/store/useKanbanStore";
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
import { useThemeStore } from "@/store/useThemeStore";
import { SelectBox } from "@/components/shared/SelectBox";
import useUpload from "@/hooks/react-query/useUpload";
import { useSearchParams } from "next/navigation";

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
  const [localDesc, setLocalDesc] = useState("");
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
  const { upload } = useUpload(task?.id);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { control, setValue } = useForm<FormData>({
    defaultValues: { assignees: [] },
  });

  const markSaving = () => {
    if (saveStatusTimerRef.current) {
      clearTimeout(saveStatusTimerRef.current);
    }
    setSaveStatus("saving");
  };

  const markSaved = () => {
    if (saveStatusTimerRef.current) {
      clearTimeout(saveStatusTimerRef.current);
    }
    setSaveStatus("saved");
    saveStatusTimerRef.current = setTimeout(() => setSaveStatus("idle"), 1800);
  };

  const markSaveError = () => {
    if (saveStatusTimerRef.current) {
      clearTimeout(saveStatusTimerRef.current);
    }
    setSaveStatus("error");
  };

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
    [updateTaskMutate],
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
    [updateTaskMutate],
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
    [updateTaskMutate],
  );

  const handleUpdateTask = (
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
      setLocalDesc(value);
      updateTask(columnKey, taskIndex, { desc: value });
      markSaving();
      debouncedUpdateDesc(task.id, value);
    }
  };

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

  useEffect(() => {
    if (task) {
      setLocalTitle(task.title ?? "");
      setLocalDesc(task.desc ?? "");
      setSaveStatus("idle");
    }
  }, [task]);

  useEffect(() => {
    if (task?.assignees) {
      setValue("assignees", task.assignees);
    } else setValue("assignees", []);
  }, [task, setValue]);

  useEffect(() => {
    return () => {
      if (saveStatusTimerRef.current) {
        clearTimeout(saveStatusTimerRef.current);
      }
      debouncedUpdateTitle.cancel();
      debouncedUpdateDesc.cancel();
      debouncedUpdateAssignees.cancel();
    };
  }, [debouncedUpdateAssignees, debouncedUpdateDesc, debouncedUpdateTitle]);

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
          className="w-full p-2 resize-none text-sm sm:text-base"
          style={{ fontSize: 16 }}
          placeholder="제목을 입력하세요"
          onChange={(e) => handleUpdateTask(e, "title")}
          value={localTitle}
        />

        <Grid className="grid grid-cols-1 sm:grid-cols-[1fr_6fr] gap-y-3 px-2 sm:px-5">
          <div className="flex items-center gap-1 whitespace-nowrap">
            <TbCircleDotted className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">상태</span>
          </div>
          <SelectBox
            options={ALL_STATUS}
            value={columnKey ?? ALL_STATUS[0]}
            onChange={handleUpdateStatus}
            renderOption={(status) => <KanbanColumnBadge columnKey={status} isDark={isDark} />}
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
        {typeof task?.id === "number" && <TaskComments taskId={task.id} />}
        <Editor
          onChange={(e) => handleUpdateTask(e, "desc")}
          content={localDesc}
          upload={upload}
          saveStatus={saveStatus}
        />
      </div>
    </div>
  );
};

export default React.memo(TaskInfoPanel);
