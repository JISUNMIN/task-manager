"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { KanbanSidebar } from "../sidebar/KanbanSidebar";
import { ClientTask, Status, useKanbanStore } from "@/store/useKanbanStore";
import dynamic from "next/dynamic";
import TextareaAutosize from "react-textarea-autosize";

import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import useProjects from "@/hooks/react-query/useProjects";
import { useSearchParams } from "next/navigation";
import { debounce } from "lodash";
import useTasks from "@/hooks/react-query/useTasks";
import { useAuthStore } from "@/store/useAuthStore";
import { getStatusColors } from "@/lib/utils/colors";
import { CardSkeleton } from "@/components/ui/extended/Skeleton/CardSkeleton";
import { useThemeStore } from "@/store/useThemeStore";
import TaskItem from "./TaskItem";
import ProjectInfoCard from "./ProjectInfoCard";
import ColumnHeader from "./KanbanColumnHeader";
import { cn } from "@/lib/utils";
import { TASK_PRIORITY_LABELS } from "@/lib/utils/task";

const TaskInfoPanel = dynamic(
  () => import("@/app/(authenticated)/dashboard/kanban/panel/TaskInfoPanel"),
  {
    ssr: false,
  },
);

const KanbanBoard = () => {
  const sidebar = useMemo(() => <KanbanSidebar />, []);
  const trigger = useMemo(() => <SidebarTrigger />, []);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const prevProjectIdRef = useRef<string | undefined>(undefined);

  // TaskInfoPanel 열림/닫힘
  const [isTaskInfoPanelOpen, setTaskInfoPanelOpen] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<string | number | null>(null);
  const closePanel = useCallback(() => setTaskInfoPanelOpen(false), []);
  const openPanel = useCallback(() => setTaskInfoPanelOpen(true), []);

  // 오른쪽 패널 width 상태
  const [panelWidth, setPanelWidth] = useState(400);
  const inputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? undefined;
  const assigneeFilterParam = searchParams.get("assignee");
  const { detailData, isDetailLoading } = useProjects(projectId);
  const debouncedUpdateMap = useRef<Record<number, (title: string) => void>>({});
  const [creatingColumns, setCreatingColumns] = useState<Set<Status>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedDueFilter, setSelectedDueFilter] = useState("all");
  const { createTaskMutate, deleteTaskMutate, updateTaskMutate, moveTaskMutate } = useTasks();
  const isPersonal = detailData?.isPersonal;
  const { user } = useAuthStore();

  const {
    columns,
    initializeColumns,
    addTask,
    updateTask,
    moveTask,
    removeColumn,
    replaceTempTask,
    progress,
  } = useKanbanStore();

  // 전체 개수 계산
  const totalCount = useMemo(
    () => Object.values(columns).reduce((acc, arr) => acc + arr.length, 0),
    [columns],
  );

  // 완료 개수
  const completedCount = useMemo(() => columns["Completed"]?.length ?? 0, [columns]);

  const projectAssignees = useMemo(() => {
    const map = new Map<number, { id: number; name: string; userId: string }>();
    detailData?.tasks?.forEach((task) => {
      task.assignees.forEach((assignee) => {
        map.set(assignee.id, {
          id: assignee.id,
          name: assignee.name,
          userId: assignee.userId,
        });
      });
    });
    return Array.from(map.values());
  }, [detailData?.tasks]);

  const isFilteredView = Boolean(
    searchTerm.trim() || selectedAssignee !== "all" || selectedPriority !== "all" || selectedDueFilter !== "all",
  );

  const filteredColumns = useMemo(() => {
    const nextColumns = {} as typeof columns;
    const keyword = searchTerm.trim().toLowerCase();

    (Object.keys(columns) as Status[]).forEach((status) => {
      nextColumns[status] = columns[status].filter((task) => {
        const matchesKeyword =
          keyword.length === 0 ||
          task.title.toLowerCase().includes(keyword) ||
          task.desc.toLowerCase().includes(keyword);

        const matchesAssignee =
          selectedAssignee === "all" ||
          task.assignees?.includes(Number(selectedAssignee));

        const matchesPriority =
          selectedPriority === "all" || task.priority === selectedPriority;

        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const taskDueDate =
          dueDate && !Number.isNaN(dueDate.getTime())
            ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
            : null;
        const diffDays =
          taskDueDate == null
            ? null
            : Math.ceil((taskDueDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

        const matchesDueFilter =
          selectedDueFilter === "all" ||
          (selectedDueFilter === "none" && !taskDueDate) ||
          (selectedDueFilter === "overdue" && diffDays !== null && diffDays < 0) ||
          (selectedDueFilter === "soon" && diffDays !== null && diffDays >= 0 && diffDays <= 3);

        return matchesKeyword && matchesAssignee && matchesPriority && matchesDueFilter;
      });
    });

    return nextColumns;
  }, [columns, searchTerm, selectedAssignee, selectedPriority, selectedDueFilter]);

  const debouncedUpdate = (taskId: number, newTitle: string) => {
    if (!debouncedUpdateMap.current[taskId]) {
      debouncedUpdateMap.current[taskId] = debounce((title: string) => {
        updateTaskMutate({ id: taskId, title: title });
      }, 500);
    }
    debouncedUpdateMap.current[taskId](newTitle);
  };
  const findTaskLocation = useMemo(() => {
    return (taskId: string | number | null) => {
      if (taskId == null) return null;

      const entries = Object.entries(columns) as [Status, ClientTask[]][];
      for (const [status, tasks] of entries) {
        const itemIndex = tasks.findIndex((task) => String(task.id) === String(taskId));
        if (itemIndex >= 0) {
          return {
            status,
            itemIndex,
            task: tasks[itemIndex],
          };
        }
      }

      return null;
    };
  }, [columns]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index)
      return;

    const sourceStatus = source.droppableId as Status;
    const destinationStatus = destination.droppableId as Status;
    const sourceVisibleTasks = filteredColumns[sourceStatus] ?? [];
    const destinationVisibleTasks = filteredColumns[destinationStatus] ?? [];
    const task = sourceVisibleTasks[source.index];
    if (!task) return;

    const sourceActualIndex = columns[sourceStatus].findIndex(
      (columnTask) => String(columnTask.id) === String(task.id),
    );
    if (sourceActualIndex < 0) return;

    const destinationVisibleWithoutDragged =
      sourceStatus === destinationStatus
        ? destinationVisibleTasks.filter((visibleTask) => String(visibleTask.id) !== String(task.id))
        : destinationVisibleTasks;

    const prevVisibleTask =
      destination.index === 0 ? null : destinationVisibleWithoutDragged[destination.index - 1] ?? null;
    const nextVisibleTask = destinationVisibleWithoutDragged[destination.index] ?? null;

    const prevActualIndex =
      prevVisibleTask == null
        ? null
        : columns[destinationStatus].findIndex(
            (columnTask) => String(columnTask.id) === String(prevVisibleTask.id),
          );
    const nextActualIndex =
      nextVisibleTask == null
        ? null
        : columns[destinationStatus].findIndex(
            (columnTask) => String(columnTask.id) === String(nextVisibleTask.id),
          );

    let destinationActualIndex: number;
    if (nextActualIndex != null && nextActualIndex >= 0) {
      destinationActualIndex = nextActualIndex;
    } else if (prevActualIndex != null && prevActualIndex >= 0) {
      destinationActualIndex = prevActualIndex + 1;
    } else {
      destinationActualIndex = 0;
    }

    if (
      sourceStatus === destinationStatus &&
      sourceActualIndex < destinationActualIndex
    ) {
      destinationActualIndex -= 1;
    }

    const prevTask = prevVisibleTask;
    const nextTask = nextVisibleTask;

    const prevOrder = prevTask?.order;
    const nextOrder = nextTask?.order;

    let newOrder: number;

    if (prevOrder == null && nextOrder == null) {
      newOrder = 0;
    } else if (prevOrder == null) {
      newOrder = nextOrder! - 1;
    } else if (nextOrder == null) {
      newOrder = prevOrder + 1;
    } else {
      newOrder = (prevOrder + nextOrder) / 2;
    }

    // 프론트 상태 업데이트 (order 반영)
    moveTask(sourceStatus, destinationStatus, sourceActualIndex, destinationActualIndex, newOrder);

    // 서버 업데이트 호출
    if (typeof task.id === "number") {
      moveTaskMutate({
        id: task.id,
        projectId: Number(projectId),
        toColumn: destinationStatus,
        newOrder,
      });
    }

    // 포커스 유지
    setFocusedTaskId(task.id);
  };

  const calculateNewTaskOrder = (
    tasks: ClientTask[],
    orderType: "top" | "bottom",
  ): number => {
    if (tasks.length === 0) {
      return 0;
    }

    if (orderType === "top") {
      return (tasks[0]?.order ?? 0) - 1;
    }

    // orderType === "bottom"
    return (tasks[tasks.length - 1]?.order ?? 0) + 1;
  };
  const handleCreateTask = async (
    columnKey: Status,
    columnIndex: number,
    orderType: "top" | "bottom" = "bottom",
  ) => {
    if (creatingColumns.has(columnKey)) return;

    setCreatingColumns((prev) => new Set(prev).add(columnKey));

    // 현재 컬럼의 tasks 가져오기
    const currentColumnTasks = columns[columnKey] || [];

    // 프론트엔드에서 order 계산
    const newOrder = calculateNewTaskOrder(currentColumnTasks, orderType);

    const tempId = `temp-${Date.now()}`;
    addTask(columnIndex, orderType, tempId);
    setFocusedTaskId(tempId);
    openPanel();

    const result = await createTaskMutate({
      title: "",
      desc: "",
      status: columnKey,
      projectId: Number(projectId),
      userId: user?.id ?? 1,
      managerId: user?.id ?? 1,
      orderType,
      newOrder,
    });
    setCreatingColumns((prev) => {
      const newSet = new Set(prev);
      newSet.delete(columnKey);
      return newSet;
    });
    replaceTempTask(columnKey, tempId, result);
    setFocusedTaskId(result.id);
  };

  const handleDeleteTask = (columnKey: Status, itemIndex: number) => {
    const task = columns[columnKey][itemIndex];
    if (typeof task.id === "number") {
      deleteTaskMutate({ id: task.id });
    }
    removeColumn(columnKey, itemIndex);
    if (String(focusedTaskId) === String(task.id)) {
      closePanel();
      setFocusedTaskId(null);
    }
  };

  const handleUpdateTask = (columnKey: Status, value: string, itemIndex: number) => {
    const task = columns[columnKey][itemIndex];
    updateTask(columnKey, itemIndex, { title: value });

    if (typeof task.id === "number") {
      debouncedUpdate(task.id, value);
    }
  };

  useEffect(() => {
    const ref = focusedTaskId == null ? null : inputRefs.current[String(focusedTaskId)];
    if (!ref) return;
    if (document.activeElement === ref) return;
    ref.focus();
  }, [focusedTaskId]);

  useEffect(() => {
    if (detailData?.tasks && prevProjectIdRef.current !== projectId) {
      const sortedTasks = detailData.tasks
        .map((task) => ({
          ...task,
          status: task.status as Status,
          order: task.order ?? Number.MAX_SAFE_INTEGER,
          assignees:
            task.assignees?.map((assignee) =>
              typeof assignee === "number" ? assignee : assignee.id,
            ) ?? [],
        }))
        .sort((a, b) => a.order - b.order);

      initializeColumns(sortedTasks);

      prevProjectIdRef.current = projectId;
    }
  }, [detailData, initializeColumns, projectId]);

  useEffect(() => {
    if (assigneeFilterParam === "me" && user?.id) {
      setSelectedAssignee(String(user.id));
      return;
    }

    setSelectedAssignee("all");
  }, [assigneeFilterParam, projectId, user?.id]);

  useEffect(() => {
    if (focusedTaskId == null) return;
    if (!findTaskLocation(focusedTaskId)) {
      setFocusedTaskId(null);
      closePanel();
    }
  }, [closePanel, findTaskLocation, focusedTaskId]);
  return (
    <SidebarProvider className={`bg-[var(--bg-fourth)] relative`}>
      {sidebar}
      {trigger}

      {/* 메인 보드 */}
      <div className="p-8 w-[80%]">
        <ProjectInfoCard
          projectName={detailData?.projectName}
          manager={detailData?.manager}
          deadline={detailData?.deadline}
          progress={progress}
          isPersonal={isPersonal}
          completedCount={completedCount}
          totalCount={totalCount}
        />

        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--box-bg)] p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-base)]">작업 검색 및 필터</h3>
              <p className="text-sm text-[var(--text-blur)]">
                제목/본문 검색, 담당자, 우선순위, 마감 임박 기준으로 보드를 빠르게 좁혀볼 수 있습니다.
              </p>
            </div>
            {isFilteredView && (
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:underline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedAssignee(assigneeFilterParam === "me" && user?.id ? String(user.id) : "all");
                  setSelectedPriority("all");
                  setSelectedDueFilter("all");
                }}
              >
                필터 초기화
              </button>
            )}
          </div>
          <div className={`grid gap-3 md:grid-cols-2 ${isPersonal ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}>
            <TextareaAutosize
              minRows={1}
              maxRows={1}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="제목 또는 본문 검색"
              className="w-full rounded-md border border-slate-300 bg-white p-2 text-black shadow-sm transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-400 dark:border-gray-500 dark:bg-gray-800 dark:text-white dark:hover:border-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-900/40 dark:placeholder:text-gray-500"
            />
            {!isPersonal && (
              <select
                value={selectedAssignee}
                onChange={(event) => setSelectedAssignee(event.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-500 dark:text-gray-100 dark:hover:border-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
              >
                <option value="all">전체 담당자</option>
                {projectAssignees.map((assignee) => (
                  <option key={assignee.id} value={String(assignee.id)}>
                    {assignee.name} ({assignee.userId})
                  </option>
                ))}
              </select>
            )}
            <select
              value={selectedPriority}
              onChange={(event) => setSelectedPriority(event.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-500 dark:text-gray-100 dark:hover:border-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
            >
              <option value="all">전체 우선순위</option>
              <option value="HIGH">{TASK_PRIORITY_LABELS.HIGH}</option>
              <option value="MEDIUM">{TASK_PRIORITY_LABELS.MEDIUM}</option>
              <option value="LOW">{TASK_PRIORITY_LABELS.LOW}</option>
            </select>
            <select
              value={selectedDueFilter}
              onChange={(event) => setSelectedDueFilter(event.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-500 dark:text-gray-100 dark:hover:border-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
            >
              <option value="all">전체 마감 상태</option>
              <option value="soon">3일 이내 마감</option>
              <option value="overdue">기한 지난 작업</option>
              <option value="none">마감일 미설정</option>
            </select>
          </div>
        </div>

        {isDetailLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-start">
              {Object.keys(columns).map((columnKey) => {
                const status = columnKey as Status;
                const keys = Object.keys(columns);
                const columnIndex = keys.indexOf(status);
                const { kanbanBoardBg } = getStatusColors(status, isDark);

                return (
                  <div
                    key={columnKey}
                    className={`flex flex-col ${kanbanBoardBg} border border-[var(--border)] rounded-xl p-4`}
                  >
                    <ColumnHeader
                      status={status}
                      isDark={isDark}
                      columnIndex={columnIndex}
                      count={filteredColumns[status].length}
                      onCreateTask={(status, columnIndex) =>
                        handleCreateTask(status, columnIndex, "top")
                      }
                      isDisabled={creatingColumns.has(status) || isFilteredView}
                    />

                    <Droppable droppableId={columnKey}>
                      {(provided) => (
                        <div
                          className="flex flex-col flex-1 space-y-3 overflow-y-auto"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {filteredColumns[status]?.map((task, filteredIndex) => {
                            if (!task) return null;
                            const itemIndex = columns[status].findIndex(
                              (columnTask) => String(columnTask.id) === String(task.id),
                            );
                            if (itemIndex < 0) return null;
                            return (
                              <TaskItem
                                key={String(task.id)}
                                columnKey={status}
                                itemIndex={itemIndex}
                                draggableIndex={filteredIndex}
                                task={task}
                                handleDeleteTask={handleDeleteTask}
                                handleUpdateTask={handleUpdateTask}
                                setFocusedTaskId={setFocusedTaskId}
                                openPanel={openPanel}
                                inputRefs={inputRefs}
                              />
                            );
                          })}

                          {provided.placeholder}

                          <button
                            onClick={() => handleCreateTask(status, columnIndex, "bottom")}
                            disabled={creatingColumns.has(status) || isFilteredView}
                            className={cn(
                              "bg-[var(--btn-bg)] border-2 border-dashed border-[var(--btn-border)] rounded-lg p-3 text-center text-[var(--text-blur)] transition-all duration-200 mt-3",
                              creatingColumns.has(status) || isFilteredView
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-[var(--btn-hover-bg)] hover:border-[var(--btn-hover-border)] hover:text-[var(--foreground)] cursor-pointer",
                            )}
                          >
                            + 새 작업 추가
                          </button>
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      <TaskInfoPanel
        isTaskInfoPanelOpen={isTaskInfoPanelOpen}
        closePanel={closePanel}
        focusedTaskId={focusedTaskId}
        setFocusedTaskId={setFocusedTaskId}
        isPersonal={isPersonal}
        panelWidth={panelWidth}
        setPanelWidth={setPanelWidth}
        inputRefs={inputRefs}
      />
    </SidebarProvider>
  );
};

export default KanbanBoard;
