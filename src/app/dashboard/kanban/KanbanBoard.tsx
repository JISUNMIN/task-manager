"use client";

import React, { useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { debounce } from "lodash";

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
import { Input } from "@/components/ui/input";

const KanbanBoard = () => {
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [isTaskInfoPanelOpen, setTaskInfoPanelrOpen] = useState(false);
  const togglePanel = () => setTaskInfoPanelrOpen(!isTaskInfoPanelOpen);

  const {
    columns,
    newTaskInputs,
    addTask,
    updateTask,
    setNewTaskInput,
    resetTaskInput,
  } = useKanbanStore();

  // 칸반 열에 추가할 작업을 저장
  const handleInputChange = debounce((columnKey: status, itemIndex: number) => {
    if (inputRefs.current[`${columnKey}-${itemIndex}`]) {
      const value = inputRefs.current[`${columnKey}-${itemIndex}`]?.value || "";
      updateTask(columnKey, value, itemIndex);
    }
  }, 1500);
  console.log("columns확인용", columns);

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
                      {columns[columnKey as status].map((item, itemIndex) => {
                        console.log("item", item);
                        return (
                          <div
                            key={`${columnIndex}-${itemIndex}`}
                            className="mb-4"
                          >
                            <Input
                              type="text"
                              ref={(el) =>
                                (inputRefs.current[
                                  `${columnKey}-${itemIndex}`
                                ] = el)
                              }
                              defaultValue={item?.title}
                              onClick={() => setTaskInfoPanelrOpen(true)}
                              onChange={() =>
                                handleInputChange(
                                  columnKey as status,
                                  itemIndex
                                )
                              }
                              placeholder="Enter new task"
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        );
                      })}
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
        />
      </ResizablePanelGroup>
    </SidebarProvider>
  );
};

export default KanbanBoard;
