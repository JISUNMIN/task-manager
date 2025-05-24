"use client";

import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { KanbanSidebar } from "./KanbanSidebar";
import { status, useKanbanStore } from "@/store/useKanbanStore";
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
import { FaTrash } from "react-icons/fa";

const KanbanBoard = () => {
  const [isTaskInfoPanelOpen, setTaskInfoPanelrOpen] = useState(false);
  const togglePanel = () => setTaskInfoPanelrOpen(!isTaskInfoPanelOpen);
  const [focusedInputKey, setFocusedInputKey] = useState<string>("Completed-0");

  const { columns, addTask, updateTask, moveTask, removeColumn } =
    useKanbanStore();

  // 칸반 열에 추가할 작업을 저장
  const handleInputChange = (
    columnKey: status,
    value: string,
    itemIndex: number
  ) => {
    updateTask(columnKey, itemIndex, { title: value });
  };

  const handleDragEnd = (result: DropResult, columnKey: status) => {
    const { source, destination } = result;

    // 드래그 취소된 경우(destination이 없을 경우)
    if (!destination) return;

    // 위치가 같으면 아무 것도 하지 않음
    if (source.index === destination.index) return;

    moveTask(columnKey, columnKey, source.index, destination.index);
  };

  return (
    <SidebarProvider>
      <KanbanSidebar />
      <SidebarTrigger />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={75}>
          {/* 칸반 보드 영역 */}
          <div className={`p-8 mt-10`}>
            <h1 className="text-3xl font-semibold mb-6">Kanban Board</h1>

            {/* 칸반 열 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {Object.keys(columns).map((columnKey) => {
                const keys = Object.keys(columns);
                const columnIndex = keys.indexOf(columnKey);

                return (
                  <div key={columnKey} className="flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <KanbanColumnBadge columnKey={columnKey as status} />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          addTask(columnIndex);
                        }}
                        className="bg-gray-400 text-white rounded"
                      >
                        <FaPlus />
                      </Button>
                    </div>

                    {/* 칸반 항목들 세로로 정렬 */}
                    <div className="flex flex-col">
                      <DragDropContext
                        onDragEnd={(result) =>
                          handleDragEnd(result, columnKey as status)
                        }
                      >
                        <Droppable droppableId="droppable-column">
                          {(provided) => (
                            <div
                              className="flex flex-col"
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {columns[columnKey as status].map(
                                (item, itemIndex) => (
                                  <Draggable
                                    key={`${columnIndex}-${itemIndex}`}
                                    draggableId={`${columnIndex}-${itemIndex}`}
                                    index={itemIndex}
                                  >
                                    {(provided) => (
                                      <div
                                        className="mb-4"
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        {/* 드래그 핸들 */}
                                        <div
                                          {...provided.dragHandleProps}
                                          className="text-gray-800 text-right"
                                        >
                                          ⠿
                                        </div>
                                        <TextareaAutosize
                                          value={
                                            columns[columnKey as status][
                                              Number(itemIndex)
                                            ].title
                                          }
                                          onChange={(e) =>
                                            handleInputChange(
                                              columnKey as status,
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
                                        <div
                                          onClick={() =>
                                            removeColumn(
                                              columnKey as status,
                                              itemIndex
                                            )
                                          }
                                          className="flex items-center"
                                        >
                                          <FaTrash />
                                          <button>Delete</button>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                )
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ResizablePanel>

        {isTaskInfoPanelOpen && <ResizableHandle withHandle />}
        <TaskInfoPanel
          isTaskInfoPanelOpen={isTaskInfoPanelOpen}
          togglePanel={togglePanel}
          focusedInputKey={focusedInputKey}
        />
      </ResizablePanelGroup>
    </SidebarProvider>
  );
};

export default KanbanBoard;
