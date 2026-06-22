"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { KanbanSidebar } from "../sidebar/KanbanSidebar";
import { ClientTask, Status, useKanbanStore } from "@/store/useKanbanStore";
import dynamic from "next/dynamic";

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
import TextareaAutosize from "react-textarea-autosize";
import { getTaskDueStatus, TASK_PRIORITY_LABELS } from "@/lib/utils/task";

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
  const closePanel = () => setTaskInfoPanelOpen(false);
  const openPanel = () => setTaskInfoPanelOpen(true);

  // 오른쪽 패널 width 상태
  const [panelWidth, setPanelWidth] = useState(400);
  const [focusedInputKey, setFocusedInputKey] = useState<string>("Completed-0");
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
        if (typeof assignee === "number") return;

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
    searchTerm.trim() ||
      selectedAssignee !== "all" ||
      selectedPriority !== "all" ||
      selectedDueFilter !== "all",
  );

  const filteredColumns = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const nextColumns = {} as Record<Status, ClientTask[]>;

    (Object.keys(columns) as Status[]).forEach((status) => {
      nextColumns[status] = columns[status].filter((task) => {
        const matchesKeyword =
          keyword.length === 0 ||
          task.title.toLowerCase().includes(keyword) ||
          task.desc.toLowerCase().includes(keyword);

        const matchesAssignee =
          selectedAssignee === "all" || task.assignees?.includes(Number(selectedAssignee));

        const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;

        const dueStatus = getTaskDueStatus(task.dueDate);
        const matchesDueFilter =
          selectedDueFilter === "all" ||
          (selectedDueFilter === "none" && dueStatus === "none") ||
          (selectedDueFilter === "overdue" && dueStatus === "overdue") ||
          (selectedDueFilter === "soon" && (dueStatus === "today" || dueStatus === "soon"));

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
  const handleDragEnd = (result: DropResult) => {
    if (isFilteredView) return;

    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index)
      return;

    const sourceStatus = source.droppableId as Status;
    const destinationStatus = destination.droppableId as Status;
    const task = columns[sourceStatus][source.index];

    // 프론트에서 order 계산
    const tempTasks = [...columns[destinationStatus]];
    if (sourceStatus === destinationStatus) {
      // 같은 컬럼이면 원래 자리에서 제거
      tempTasks.splice(source.index, 1);
    }
    tempTasks.splice(destination.index, 0, task);

    let prevTask: typeof task | null = null;
    let nextTask: typeof task | null = null;

    if (destination.index === 0) {
      // 맨 위
      prevTask = null;
      nextTask = tempTasks[1] ?? null;
    } else if (destination.index >= tempTasks.length - 1) {
      // 맨 아래
      prevTask = tempTasks[tempTasks.length - 2] ?? null;
      nextTask = null;
    } else {
      // 중간
      prevTask = tempTasks[destination.index - 1];
      nextTask = tempTasks[destination.index + 1];
    }

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
    moveTask(sourceStatus, destinationStatus, source.index, destination.index, newOrder);

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
    setFocusedInputKey(`${destinationStatus}-${destination.index}`);
  };
  const handleFocusedInputKey = (columnKey: string, itemIndex: number) => {
    setFocusedInputKey(`${columnKey}-${itemIndex}`);
  };

  const calculateNewTaskOrder = (tasks: ClientTask[], orderType: "top" | "bottom"): number => {
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
  };

  const handleDeleteTask = (columnKey: Status, itemIndex: number) => {
    const task = columns[columnKey][itemIndex];
    if (typeof task.id === "number") {
      deleteTaskMutate({ id: task.id });
    }
    removeColumn(columnKey, itemIndex);
  };

  const handleUpdateTask = (columnKey: Status, value: string, itemIndex: number) => {
    const task = columns[columnKey][itemIndex];
    updateTask(columnKey, itemIndex, { title: value });

    if (typeof task.id === "number") {
      debouncedUpdate(task.id, value);
    }
  };

  useEffect(() => {
    const ref = inputRefs.current[focusedInputKey];
    if (ref) ref.focus();
  }, [focusedInputKey]);

  useEffect(() => {
    if (detailData?.tasks && prevProjectIdRef.current !== projectId) {
      const sortedTasks = detailData.tasks
        .map((task) => ({
          ...task,
          status: task.status as Status,
          order: task.order ?? Number.MAX_SAFE_INTEGER,
          dueDate: task.dueDate ? String(task.dueDate) : null,
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

  const renderTaskItems = (status: Status) => {
    const visibleTasks = filteredColumns[status] ?? [];

    return visibleTasks.map((task) => {
      const itemIndex = columns[status].findIndex(
        (columnTask) => String(columnTask.id) === String(task.id),
      );
      if (itemIndex < 0) return null;

      return (
        <TaskItem
          key={`${status}-${itemIndex}`}
          columnKey={status}
          itemIndex={itemIndex}
          task={task}
          handleDeleteTask={handleDeleteTask}
          handleUpdateTask={handleUpdateTask}
          setFocusedInputKey={setFocusedInputKey}
          openPanel={openPanel}
          inputRefs={inputRefs}
          isDragDisabled={isFilteredView}
        />
      );
    });
  };

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

        <div className="mb-6 rounded-2xl border border-[#dfe6ec] bg-white/95 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:border-[var(--border)] dark:bg-[var(--surface-2)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.02)]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-base)]">작업 검색 및 필터</h3>
              <p className="text-sm text-[var(--text-blur)]">
                제목/본문 검색, 담당자, 우선순위, 마감 임박 기준으로 보드를 빠르게 좁혀볼 수
                있습니다.
              </p>
            </div>
            {isFilteredView && (
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedAssignee(
                    assigneeFilterParam === "me" && user?.id ? String(user.id) : "all",
                  );
                  setSelectedPriority("all");
                  setSelectedDueFilter("all");
                }}
              >
                필터 초기화
              </button>
            )}
          </div>
          <div
            className={`grid gap-3 md:grid-cols-2 ${isPersonal ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}
          >
            <TextareaAutosize
              minRows={1}
              maxRows={1}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="제목 또는 본문 검색"
              className="app-field resize-none py-2 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            {!isPersonal && (
              <select
                value={selectedAssignee}
                onChange={(event) => setSelectedAssignee(event.target.value)}
                className="app-field"
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
              className="app-field"
            >
              <option value="all">전체 우선순위</option>
              <option value="HIGH">{TASK_PRIORITY_LABELS.HIGH}</option>
              <option value="MEDIUM">{TASK_PRIORITY_LABELS.MEDIUM}</option>
              <option value="LOW">{TASK_PRIORITY_LABELS.LOW}</option>
            </select>
            <select
              value={selectedDueFilter}
              onChange={(event) => setSelectedDueFilter(event.target.value)}
              className="app-field"
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
        ) : isFilteredView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-start">
            {Object.keys(columns).map((columnKey) => {
              const status = columnKey as Status;
              const keys = Object.keys(columns);
              const columnIndex = keys.indexOf(status);
              const { kanbanBoardBg } = getStatusColors(status, isDark);
              const visibleTasks = filteredColumns[status] ?? [];
              const count = visibleTasks.length;

              return (
                <div
                  key={columnKey}
                  className={`flex flex-col ${kanbanBoardBg} border border-[var(--border)] rounded-xl p-4`}
                >
                  <ColumnHeader
                    status={status}
                    isDark={isDark}
                    columnIndex={columnIndex}
                    count={count}
                    onCreateTask={(nextStatus, nextColumnIndex) =>
                      handleCreateTask(nextStatus, nextColumnIndex, "top")
                    }
                    isDisabled
                  />

                  <div className="flex flex-col flex-1 space-y-3">
                    {renderTaskItems(status)}
                    <button
                      disabled
                      className="mt-3 rounded-lg border-2 border-dashed border-[var(--btn-border)] bg-[var(--btn-bg)] p-3 text-center font-medium text-[var(--text-base)] opacity-50 cursor-not-allowed"
                    >
                      + 새 작업 추가
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-start">
              {Object.keys(columns).map((columnKey) => {
                const status = columnKey as Status;
                const keys = Object.keys(columns);
                const columnIndex = keys.indexOf(status);
                const { kanbanBoardBg } = getStatusColors(status, isDark);
                const visibleTasks = filteredColumns[status] ?? [];
                const count = visibleTasks.length;

                return (
                  <div
                    key={columnKey}
                    className={`flex flex-col ${kanbanBoardBg} border border-[var(--border)] rounded-xl p-4`}
                  >
                    <ColumnHeader
                      status={status}
                      isDark={isDark}
                      columnIndex={columnIndex}
                      count={count}
                      onCreateTask={(status, columnIndex) =>
                        handleCreateTask(status, columnIndex, "top")
                      }
                      isDisabled={creatingColumns.has(status) || isFilteredView}
                    />

                    <Droppable droppableId={columnKey}>
                      {(provided) => (
                        <div
                          className="flex flex-col flex-1 space-y-3"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {renderTaskItems(status)}

                          {provided.placeholder}

                          <button
                            onClick={() => handleCreateTask(status, columnIndex, "bottom")}
                            disabled={creatingColumns.has(status) || isFilteredView}
                            className={cn(
                              "mt-3 rounded-lg border-2 border-dashed border-[var(--btn-border)] bg-[var(--btn-bg)] p-3 text-center font-medium text-[var(--text-base)] transition-all duration-200",
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
        focusedInputKey={focusedInputKey}
        handleFocusedInputKey={handleFocusedInputKey}
        isPersonal={isPersonal}
        panelWidth={panelWidth}
        setPanelWidth={setPanelWidth}
        inputRefs={inputRefs}
      />
    </SidebarProvider>
  );
};

export default KanbanBoard;
