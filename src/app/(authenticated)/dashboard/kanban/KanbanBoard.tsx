"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { KanbanSidebar } from "./KanbanSidebar";
import { Status, useKanbanStore } from "@/store/useKanbanStore";
import KanbanColumnBadge from "./KanbanColumnBadge";
import TaskInfoPanel from "./TaskInfoPanel";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import TextareaAutosize from "react-textarea-autosize";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import useProjects from "@/hooks/react-query/useProjects";
import { useSearchParams } from "next/navigation";
import { debounce } from "lodash";
import useTasks from "@/hooks/react-query/useTasks";
import { useAuthStore } from "@/store/useAuthStore";
import { getStatusColors } from "@/lib/utils/colors";
import { Trash } from "lucide-react";
import { ActionDropdownMenu } from "@/components/ui/extended/ActionDropdownMenu";
import { Progress } from "@/components/ui/progress";
import { convertDateToString } from "@/lib/utils/helpers";
import { CardSkeleton } from "@/components/ui/extended/Skeleton/CardSkeleton";
import { useThemeStore } from "@/store/useThemeStore";

const KanbanBoard = () => {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [isTaskInfoPanelOpen, setTaskInfoPanelrOpen] = useState(false);
  const togglePanel = () => setTaskInfoPanelrOpen(!isTaskInfoPanelOpen);
  const [focusedInputKey, setFocusedInputKey] = useState<string>("Completed-0");
  const inputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? undefined;
  const { detailData, isDetailLoading } = useProjects(projectId);
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
  } = useKanbanStore();

  const debouncedUpdate = useMemo(
    () =>
      debounce((taskId: number, newTitle: string) => {
        updateTaskMutate({ id: taskId, title: newTitle });
      }, 500),
    [updateTaskMutate]
  );

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

    // 로컬 상태 먼저 반영
    moveTask(sourceStatus, destinationStatus, source.index, destination.index);

    // 서버 동기화 (moveTask API 호출)
    moveTaskMutate({
      id: task.id,
      fromColumn: sourceStatus,
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
    addTask(columnIndex, orderType);
    createTaskMutate({
      title: "",
      desc: "",
      status: columnKey,
      projectId: Number(projectId),
      userId: user?.id ?? 1,
      managerId: user?.id ?? 1,
      orderType,
    });
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
    // 로컬 상태
    updateTask(columnKey, itemIndex, { title: value });
    // API 요청 debounce 처리
    debouncedUpdate(task.id, value);
  };

  useEffect(() => {
    const ref = inputRefs.current[focusedInputKey];
    if (ref) {
      ref.focus();
    }
  }, [focusedInputKey]);

  useEffect(() => {
    if (detailData?.tasks) {
      const sortedTasks = detailData.tasks
        .map((task) => ({ ...task, status: task.status as Status }))
        .sort((a, b) => {
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });

      initializeColumns(sortedTasks);
    }
  }, [detailData, initializeColumns]);
  return (
    <SidebarProvider className={`bg-[var(--bg-fourth)]`}>
      <KanbanSidebar />
      <SidebarTrigger />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={75}>
          {/* 칸반 보드 영역 */}
          <div className="p-8">
            <div className="bg-[var(--box-bg)] p-4 rounded-xl mb-6  border border-[var(--border)] shadow-sm transition-all">
              {/* 프로젝트 제목 */}
              <div className="mb-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {detailData?.projectName}
                </h2>
              </div>

              <div className="w-full space-y-2">
                {/* 담당자 + 마감일 */}
                <div className="text-sm text-[var(--sub-text)] flex flex-wrap items-center gap-x-1">
                  <span>
                    담당자:{" "}
                    <span className="font-medium">
                      {detailData?.manager.name}
                    </span>
                  </span>
                  {!isPersonal && detailData?.deadline && (
                    <>
                      <span className="mx-1">|</span>
                      <span>
                        마감일:{" "}
                        {convertDateToString(
                          new Date(detailData.deadline),
                          "-"
                        )}
                      </span>
                    </>
                  )}
                </div>

                {/* 진행률*/}
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-[var(--text-blur)]">진행률</p>
                    <span className="text-sm text-[var(--text-base)] font-medium">
                      {detailData?.progress ?? 0}%
                    </span>
                  </div>
                  <Progress value={detailData?.progress} />
                </div>
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
                        <div className="flex justify-between items-center mb-4">
                          <KanbanColumnBadge
                            columnKey={status}
                            isDark={isDark}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleCreateTask(status, columnIndex, "top")
                            }
                            className="w-8 h-8 shrink-0 bg-[var(--item-bg)] hover:bg-[var(--hover-bg)] text-[var(--text-base)] border-[var(--border)] hover:border-[var(--border)] rounded"
                          >
                            <FaPlus />
                          </Button>
                        </div>

                        {/* 각 칸반 열 */}
                        <Droppable droppableId={columnKey}>
                          {(provided) => (
                            <div
                              className="flex flex-col min-h-full max-h-[500px] lg:max-h-[80vh] overflow-y-auto space-y-3"
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {columns[status].map((task, itemIndex) => {
                                const items = [
                                  {
                                    label: "삭제",
                                    icon: <Trash />,
                                    variant: "destructive" as const,
                                    onSelect: () =>
                                      handleDeleteTask(status, itemIndex),
                                  },
                                ];

                                return (
                                  <Draggable
                                    key={`${columnKey}-${itemIndex}`}
                                    draggableId={`${columnKey}-${itemIndex}`}
                                    index={itemIndex}
                                  >
                                    {(provided) => (
                                      <div
                                        className="bg-[var(--box-bg)] border  rounded-lg p-3 cursor-pointer"
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <div className="text-right">
                                          <ActionDropdownMenu items={items} />
                                        </div>

                                        <TextareaAutosize
                                          ref={(el) => {
                                            inputRefs.current[
                                              `${columnKey}-${itemIndex}`
                                            ] = el;
                                          }}
                                          value={task.title}
                                          onChange={(e) =>
                                            handleUpdateTask(
                                              status,
                                              e.target.value,
                                              itemIndex
                                            )
                                          }
                                          onFocus={() =>
                                            setFocusedInputKey(
                                              `${columnKey}-${itemIndex}`
                                            )
                                          }
                                          onClick={() =>
                                            setTaskInfoPanelrOpen(true)
                                          }
                                          placeholder="제목을 입력하세요"
                                          className="w-full p-2 border text-[var(--text-base)] rounded dark:focus:border-gray-300 dark:focus:outline-none"
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}

                              {provided.placeholder}

                              {/* 새 작업 추가 버튼 */}
                              <button
                                onClick={() =>
                                  handleCreateTask(
                                    status,
                                    columnIndex,
                                    "bottom"
                                  )
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
        </ResizablePanel>

        {isTaskInfoPanelOpen && <ResizableHandle withHandle />}
        <TaskInfoPanel
          isTaskInfoPanelOpen={isTaskInfoPanelOpen}
          togglePanel={togglePanel}
          focusedInputKey={focusedInputKey}
          handleFocusedInputKey={handleFocusedInputKey}
          isPersonal={isPersonal}
        />
      </ResizablePanelGroup>
    </SidebarProvider>
  );
};

export default KanbanBoard;
