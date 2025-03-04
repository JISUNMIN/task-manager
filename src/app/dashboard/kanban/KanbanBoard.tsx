"use client";

import React, { useState } from "react";
import TaskCard from "./TaskCard";
import { FaBars, FaTimes } from "react-icons/fa";
import Sidebar from "./Sidebar";

const KanbanBoard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // 더미 데이터 (카드들)
  const tasks = [
    { title: "Task 1", description: "This is task 1" },
    { title: "Task 2", description: "This is task 2" },
    { title: "Task 3", description: "This is task 3" },
  ];

  return (
    <div className="flex">
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
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* 칸반 보드 영역 */}
      <div
        className={`flex-grow p-8 mt-10 transition-all duration-300 ${isSidebarOpen ? "ml-80" : ""}  min-h-screen`}
      >
        <h1 className="text-3xl font-semibold mb-6">Kanban Board</h1>
        <div className="grid grid-cols-3 gap-4">
          {tasks.map((task, index) => (
            <TaskCard
              key={index}
              title={task.title}
              description={task.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
