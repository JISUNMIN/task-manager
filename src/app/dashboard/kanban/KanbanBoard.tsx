"use client";

import React, { useEffect, useState } from "react";
import TaskCard from "./TaskCard";
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

const KanbanBoard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isTaskInfoPanelOpen, setTaskInfoPanelrOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<status | null>(null);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const togglePanel = () => setTaskInfoPanelrOpen(!isTaskInfoPanelOpen);

  const columns = useKanbanStore((state) => state.columns);
  const newTaskInput = useKanbanStore((state) => state.newTaskInput);
  const addTask = useKanbanStore((state) => state.addTask);
  const setNewTaskInput = useKanbanStore((state) => state.setNewTaskInput);
  const startAddingTask = useKanbanStore((state) => state.startAddingTask);
  const stopAddingTask = useKanbanStore((state) => state.stopAddingTask);

  // 칸반 열에 추가할 작업을 저장
  const handleAddTask = (columnName: status) => {
    if (newTaskInput.trim()) {
      addTask(columnName, newTaskInput);
      setNewTaskInput(""); // 입력값 초기화
      stopAddingTask(); // 추가 입력 모드 종료
      setActiveColumn(null); // 작업 추가 후 열 닫기
    }
  };

  const handleInput = () => {
    setTaskInfoPanelrOpen(true);
  };

  // 사이드바와 activeColumn 상태 변화 콘솔 출력
  useEffect(() => {
    console.log("Sidebar open status:", isSidebarOpen);
  }, [isSidebarOpen]);

  useEffect(() => {
    console.log("Active column status:", activeColumn);
  }, [activeColumn]);

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
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
              onClick={() => console.log("test")}
            >
              {Object.keys(columns).map((columnKey) => {
                const column = columns[columnKey as status];
                return (
                  <div key={columnKey} className="flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <KanbanColumnBadge columnKey={columnKey as status} />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setActiveColumn(columnKey as status);
                          startAddingTask();
                        }}
                        className="bg-gray-400 text-white rounded"
                      >
                        <FaPlus />
                      </Button>
                    </div>

                    {/* 입력 필드 표시 */}
                    {activeColumn === columnKey && (
                      <div className="mb-4">
                        <input
                          type="text"
                          value={newTaskInput}
                          onClick={handleInput}
                          onChange={(e) => setNewTaskInput(e.target.value)}
                          placeholder="Enter new task"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    )}

                    {/* 칸반 열에 해당하는 작업 카드들 */}
                    <div>
                      {column.map((task, index) => (
                        <TaskCard
                          key={index}
                          title={task}
                          description="Task description"
                        />
                      ))}
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
