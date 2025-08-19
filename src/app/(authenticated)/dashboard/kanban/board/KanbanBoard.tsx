"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { KanbanSidebar } from "../sidebar/KanbanSidebar";
import { Status, useKanbanStore } from "@/store/useKanbanStore";
import dynamic from "next/dynamic";

import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import useProjects from "@/hooks/react-query/useProjects";
import { useSearchParams } from "next/navigation";
import { debounce } from "lodash";
import useTasks, { BatchMoveItem } from "@/hooks/react-query/useTasks";
import { useAuthStore } from "@/store/useAuthStore";
import { getStatusColors } from "@/lib/utils/colors";
import { CardSkeleton } from "@/components/ui/extended/Skeleton/CardSkeleton";
import { useThemeStore } from "@/store/useThemeStore";
import TaskItem from "./TaskItem";
import ProjectInfoCard from "./ProjectInfoCard";
import ColumnHeader from "./KanbanColumnHeader";

const TaskInfoPanel = dynamic(
  () => import("@/app/(authenticated)/dashboard/kanban/panel/TaskInfoPanel"),
  {
    ssr: false,
  }
);

const KanbanBoard = () => {
  const sidebar = useMemo(() => <KanbanSidebar />, []);
  const trigger = useMemo(() => <SidebarTrigger />, []);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const prevProjectIdRef = useRef<string | undefined>(undefined);
  const [pendingMoves, setPendingMoves] = useState<BatchMoveItem[]>([]);

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
  const { detailData, isDetailLoading } = useProjects(projectId);
  const debouncedUpdateMap = useRef<Record<number, (title: string) => void>>(
    {}
  );
  const {
    createTaskMutate,
    deleteTaskMutate,
    updateTaskMutate,
    moveTasksMutate,
  } = useTasks();
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
    [columns]
  );

  // 완료 개수
  const completedCount = useMemo(
    () => columns["Completed"]?.length ?? 0,
    [columns]
  );

  const debouncedUpdate = (taskId: number, newTitle: string) => {
    if (!debouncedUpdateMap.current[taskId]) {
      debouncedUpdateMap.current[taskId] = debounce((title: string) => {
        updateTaskMutate({ id: taskId, title: title });
      }, 500);
    }
    debouncedUpdateMap.current[taskId](newTitle);
  };

  // handleDragEnd 예시 (단일 이동도 배열로 처리)
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, combine } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceStatus = source.droppableId as Status;
    const destinationStatus = destination.droppableId as Status;

    // 이동할 Task 가져오기
    const task = columns[sourceStatus][source.index];

    // 1) 로컬 상태 바로 변경
    moveTask(sourceStatus, destinationStatus, source.index, destination.index);
    setFocusedInputKey(`${destinationStatus}-${destination.index}`);

    // 2) pendingMoves에 추가
    setPendingMoves((prev) => [
      ...prev,
      {
        taskId: task.id,
        toColumn: destinationStatus,
        toIndex: destination.index,
      },
    ]);
  };

  const handleFocusedInputKey = (columnKey: string, itemIndex: number) => {
    setFocusedInputKey(`${columnKey}-${itemIndex}`);
  };

  const handleCreateTask = (
    columnKey: Status,
    columnIndex: number,
    orderType: "top" | "bottom" = "bottom"
  ) => {
    const tempId = `temp-${Date.now()}`;
    addTask(columnIndex, orderType, tempId);

    createTaskMutate(
      {
        title: "",
        desc: "",
        status: columnKey,
        projectId: Number(projectId),
        userId: user?.id ?? 1,
        managerId: user?.id ?? 1,
        orderType,
      },
      {
        onSuccess: (realTask) => {
          replaceTempTask(columnKey, tempId, realTask);
        },
      }
    );
  };

  const handleDeleteTask = (columnKey: Status, itemIndex: number) => {
    const task = columns[columnKey][itemIndex];
    deleteTaskMutate({ id: task.id });
    removeColumn(columnKey, itemIndex);
  };

  const handleUpdateTask = (
    columnKey: Status,
    value: string,
    itemIndex: number
  ) => {
    const task = columns[columnKey][itemIndex];
    updateTask(columnKey, itemIndex, { title: value });

    if (typeof task.id === "number") {
      debouncedUpdate(task.id, value);
    }
  };

  useEffect(() => {
    if (pendingMoves.length === 0) return;

    const timer = setTimeout(() => {
      moveTasksMutate({ batch: pendingMoves });
      setPendingMoves([]); // 초기화
    }, 1000);

    return () => clearTimeout(timer);
  }, [pendingMoves]);

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
        }))
        .sort((a, b) => a.order - b.order);

      initializeColumns(sortedTasks);

      prevProjectIdRef.current = projectId;
    }
  }, [detailData, initializeColumns, projectId]);
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
                const count = columns[status].length;

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
                    />

                    <Droppable droppableId={columnKey}>
                      {(provided) => (
                        <div
                          className="flex flex-col min-h-full max-h-[500px] lg:max-h-[80vh] overflow-y-auto space-y-3"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {columns[status]?.map((task, itemIndex) => {
                            if (!task) return null;
                            return (
                              <TaskItem
                                key={`${columnKey}-${itemIndex}`}
                                columnKey={columnKey}
                                itemIndex={itemIndex}
                                task={task}
                                handleDeleteTask={handleDeleteTask}
                                handleUpdateTask={handleUpdateTask}
                                setFocusedInputKey={setFocusedInputKey}
                                openPanel={openPanel}
                                inputRefs={inputRefs}
                              />
                            );
                          })}

                          {provided.placeholder}

                          <button
                            onClick={() =>
                              handleCreateTask(status, columnIndex, "bottom")
                            }
                            className="bg-[var(--btn-bg)] border-2 border-dashed border-[var(--btn-border)] hover:bg-[var(--btn-hover-bg)] hover:border-[var(--btn-hover-border)] hover:text-[var(--foreground)] rounded-lg p-3 text-center text-[var(--text-blur)] cursor-pointer transition-all duration-200  mt-3"
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
