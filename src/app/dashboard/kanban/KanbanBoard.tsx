"use client";

import React, { useState } from "react";
import TaskCard from "./TaskCard";
import { FaBars, FaTimes, FaPlus } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { status, useKanbanStore } from "@/store/useKanbanStore";
import KanbanColumnBadge from "./KanbanColumnBadge";
import TaskInfoPanel from "./TaskInfoPanel";

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

  return (
    <div className="flex flex-col md:flex-row">
      {/* 왼쪽 사이드바 열기 버튼 */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 px-4 py-2 bg-gray-300 text-gray-800 rounded z-20"
      >
        {isSidebarOpen ? (
          <FaTimes className="w-6 h-6" />
        ) : (
          <FaBars className="w-6 h-6" />
        )}
      </button>

      {/* 사이드바 */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* 칸반 보드 영역 */}
      <div
        className={`flex-grow p-8 mt-10 transition-all duration-300 ${isSidebarOpen ? "ml-[12vw]" : ""} ${isTaskInfoPanelOpen ? "mr-[20vw]" : ""} min-h-screen`}
      >
        <h1 className="text-3xl font-semibold mb-6">Kanban Board</h1>

        {/* 칸반 열 영역 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.keys(columns).map((columnKey) => {
            const column = columns[columnKey as status];
            return (
              <div key={columnKey} className="flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <KanbanColumnBadge columnKey={columnKey as status} />
                  <button
                    onClick={() => {
                      setActiveColumn(columnKey as status);
                      startAddingTask();
                    }}
                    className="px-2 py-1 bg-gray-400 text-white rounded"
                  >
                    <FaPlus />
                  </button>
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

        {/* 사이드바 */}
        <TaskInfoPanel
          isTaskInfoPanelOpen={isTaskInfoPanelOpen}
          togglePanel={togglePanel}
        />
      </div>
    </div>
  );
};

export default KanbanBoard;
