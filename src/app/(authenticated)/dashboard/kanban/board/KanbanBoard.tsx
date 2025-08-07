"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { KanbanSidebar } from "../sidebar/KanbanSidebar";
import { Status, useKanbanStore } from "@/store/useKanbanStore";
import TaskInfoPanel from "../panel/TaskInfoPanel";

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

const KanbanBoard = () => {
  const sidebar = useMemo(() => <KanbanSidebar />, []);
  const trigger = useMemo(() => <SidebarTrigger />, []);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

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
    moveTaskMutate,
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
  } = useKanbanStore();

  const debouncedUpdate = (taskId: number, newTitle: string) => {
    if (!debouncedUpdateMap.current[taskId]) {
      debouncedUpdateMap.current[taskId] = debounce((title: string) => {
        updateTaskMutate({ id: taskId, title: title });
      }, 500);
    }
    debouncedUpdateMap.current[taskId](newTitle);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceStatus = source.droppableId as Status;
    const destinationStatus = destination.droppableId as Status;
    const task = columns[sourceStatus][source.index];

    moveTask(sourceStatus, destinationStatus, source.index, destination.index);

    moveTaskMutate({
      id: task.id,
      toColumn: destinationStatus,
      toIndex: destination.index,
    });

    setFocusedInputKey(`${destinationStatus}-${destination.index}`);
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
    const ref = inputRefs.current[focusedInputKey];
    if (ref) ref.focus();
  }, [focusedInputKey]);

  useEffect(() => {
    if (detailData?.tasks) {
      const sortedTasks = detailData.tasks
        .map((task) => ({
          ...task,
          status: task.status as Status,
          order: task.order ?? Number.MAX_SAFE_INTEGER,
        }))
        .sort((a, b) => a.order - b.order);

      initializeColumns(sortedTasks);
    }
  }, [detailData, initializeColumns]);

  return (
    <SidebarProvider className={`bg-[var(--bg-fourth)] relative`}>
      {sidebar}
      {trigger}

      {/* 메인 보드 */}
      <div className="p-8 w-[80%]">
        <ProjectInfoCard
          projectName={detailData?.projectName}
          managerName={detailData?.manager.name}
          deadline={detailData?.deadline}
          progress={detailData?.progress}
          isPersonal={isPersonal}
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

                return (
                  <div
                    key={columnKey}
                    className={`flex flex-col ${kanbanBoardBg} border border-[var(--border)] rounded-xl p-4`}
                  >
                    <ColumnHeader
                      status={status}
                      isDark={isDark}
                      columnIndex={columnIndex}
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
