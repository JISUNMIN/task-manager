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

const KanbanBoard = () => {
  const [isTaskInfoPanelOpen, setTaskInfoPanelrOpen] = useState(false);
  const togglePanel = () => setTaskInfoPanelrOpen(!isTaskInfoPanelOpen);
  const [focusedInputKey, setFocusedInputKey] = useState<string>("Completed-0");
  const inputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? undefined;
  const { detailData } = useProjects(projectId);

  const { createTaskMutate, deleteTaskMutate, updateTaskMutate } = useTasks();
  const isPersonal = detailData?.isPersonal;

  const {
    columns,
    initializeColumns,
    addTask,
    updateTask,
    moveTask,
    removeColumn,
  } = useKanbanStore();

  // 칸반 열에 추가할 작업을 저장
  const handleInputChange = (
    columnKey: Status,
    value: string,
    itemIndex: number
  ) => {
    updateTask(columnKey, itemIndex, { title: value });
  };

  // 드래그 앤 드롭 종료 시 호출
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    // 같은 위치에서 놓으면 처리 안함
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    moveTask(
      source.droppableId as Status,
      destination.droppableId as Status,
      source.index,
      destination.index
    );
    setFocusedInputKey(`${destination.droppableId}-${destination.index}`);
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
      userId: 1, // 실제 로그인 유저 ID로 대체
      managerId: 1, // 실제 매니저 ID로 대체
    });
  };

  const handleDeleteTask = (columnKey: Status, itemIndex: number) => {
    const task = columns[columnKey][itemIndex];
    deleteTaskMutate({ id: task.id });
    removeColumn(columnKey, itemIndex);
  };

  const debouncedUpdate = useMemo(
    () =>
      debounce((taskId: number, newTitle: string) => {
        updateTaskMutate({ id: taskId, title: newTitle });
      }, 1500),
    []
  );
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {Object.keys(columns).map((columnKey) => {
                  const keys = Object.keys(columns);
                  const columnIndex = keys.indexOf(columnKey);

                  return (
                    <div key={columnKey} className="flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <KanbanColumnBadge columnKey={columnKey as Status} />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleCreateTask(columnKey as Status, columnIndex)
                          }
                          className="bg-gray-400 text-white rounded"
                        >
                          <FaPlus />
                        </Button>
                      </div>

                      {/* 각 칸반 열 */}
                      <Droppable droppableId={columnKey}>
                        {(provided) => (
                          <div
                            className="flex flex-col"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {columns[columnKey as Status].map(
                              (item, itemIndex) => (
                                <Draggable
                                  key={`${columnKey}-${itemIndex}`}
                                  draggableId={`${columnKey}-${itemIndex}`}
                                  index={itemIndex}
                                >
                                  {(provided) => (
                                    <div
                                      className="mb-4 border rounded p-2 bg-white"
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      {/* 드래그 핸들 */}
                                      <div className="text-gray-800 text-right">
                                        ⠿
                                      </div>

                                      <TextareaAutosize
                                        ref={(el) => {
                                          inputRefs.current[
                                            `${columnKey}-${itemIndex}`
                                          ] = el;
                                        }}
                                        value={
                                          columns[columnKey as Status][
                                            itemIndex
                                          ].title
                                        }
                                        onChange={(e) =>
                                          handleUpdateTask(
                                            columnKey as Status,
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
                                          handleDeleteTask(
                                            columnKey as Status,
                                            itemIndex
                                          )
                                        }
                                        className="flex items-center mt-1
                                         hover:text-red-600"
                                      >
                                        <FaTrash className="mr-1" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              )
                            )}
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
