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

const KanbanBoard = () => {
  const [isTaskInfoPanelOpen, setTaskInfoPanelrOpen] = useState(false);
  const togglePanel = () => setTaskInfoPanelrOpen(!isTaskInfoPanelOpen);
  const [focusedInputKey, setFocusedInputKey] = useState<string>("Completed-0");
  const inputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? undefined;
  const { detailData } = useProjects(projectId);
  const {
    createTaskMutate,
    deleteTaskMutate,
    updateTaskMutate,
    updateTaskStatus,
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

    moveTask(sourceStatus, destinationStatus, source.index, destination.index);
    updateTaskStatus({ id: task.id, status: destinationStatus });
    setFocusedInputKey(`${destinationStatus}-${destination.index}`);
  };

  const handleFocusedInputKey = (columnKey: string, itemIndex: number) => {
    setFocusedInputKey(`${columnKey}-${itemIndex}`);
  };

  const handleCreateTask = (columnKey: Status, columnIndex: number) => {
    addTask(columnIndex);
    createTaskMutate({
      title: "",
      desc: "",
      status: columnKey,
      projectId: Number(projectId),
      userId: user?.id ?? 1,
      managerId: user?.id ?? 1,
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
      initializeColumns(
        detailData.tasks.map((task) => ({
          ...task,
          status: task.status as Status,
        }))
      );
    }
  }, [detailData, initializeColumns]);

  return (
    <SidebarProvider>
      <KanbanSidebar />
      <SidebarTrigger />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={75}>
          {/* 칸반 보드 영역 */}
          <div className="p-8 mt-10">
            <h1 className="text-3xl font-semibold mb-6">작업 보드</h1>

            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
                {Object.keys(columns).map((columnKey) => {
                  const status = columnKey as Status;
                  const keys = Object.keys(columns);
                  const columnIndex = keys.indexOf(status);
                  const { kanbanBoardBg } = getStatusColors(status);

                  return (
                    <div
                      key={columnKey}
                      className={`flex flex-col ${kanbanBoardBg} rounded p-4`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <KanbanColumnBadge columnKey={status} />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCreateTask(status, columnIndex)}
                          className="bg-gray-400 text-white rounded"
                        >
                          <FaPlus />
                        </Button>
                      </div>

                      {/* 각 칸반 열 */}
                      <Droppable droppableId={columnKey}>
                        {(provided) => (
                          <div
                            className={`flex flex-col min-h-full max-h-[500px] lg:max-h-[80vh] p-1 overflow-y-auto`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {columns[status].map((task, itemIndex) => (
                              <Draggable
                                key={`${columnKey}-${itemIndex}`}
                                draggableId={`${columnKey}-${itemIndex}`}
                                index={itemIndex}
                              >
                                {(provided) => (
                                  <div
                                    className="mb-4 border rounded p-4 bg-white"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <div className="text-gray-800 text-right">
                                      ⠿
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
                                      placeholder="Enter new task"
                                      className="w-full p-2 border rounded"
                                    />
                                    <button
                                      onClick={() =>
                                        handleDeleteTask(status, itemIndex)
                                      }
                                      className="flex items-center mt-1 hover:text-red-600"
                                    >
                                      <FaTrash className="mr-1" />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
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
