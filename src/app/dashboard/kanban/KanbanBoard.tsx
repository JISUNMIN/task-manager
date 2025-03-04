"use client";

import React, { useState } from "react";
import TaskCard from "./TaskCard";
import { FaBars, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { mockProjects } from "@/mocks/project";
import { logo } from "@/assets/images";
import Image from "next/image";

const KanbanBoard = () => {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // 더미 데이터 (카드들)
  const tasks = [
    { title: "Task 1", description: "This is task 1" },
    { title: "Task 2", description: "This is task 2" },
    { title: "Task 3", description: "This is task 3" },
  ];

  const handleNavigate = () => {
    router.push("/projectlist");
  };

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
      <div
        className={`transition-transform transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-0`}
      >
        <div className="w-80 bg-white p-4 h-full flex flex-col overflow-y-auto">
          {/* 로고 */}
          <div className="flex justify-center mt-8">
            <Image src={logo} alt="Logo" width={150} height={300} />
          </div>
          <p className="text-2xl font-extrabold text-center text-gray-800  drop-shadow-md mb-2">
            Squirrel Board
          </p>
          <div>
            <ul>
              {mockProjects.map((project) => (
                <li
                  // hover:bg-green-50
                  className="mb-2 border-b border-gray-300 bg-gray-50 p-3 rounded-md shadow-sm 
                   cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  key={project.name}
                  onClick={() =>
                    console.log(`클릭한 프로젝트: ${project.name}`)
                  }
                >
                  <p className="font-semibold text-gray-700">
                    📌 프로젝트명: {project.name}
                  </p>
                  <p className="text-gray-600">👤 담당자: {project.manager}</p>
                  <p className="text-gray-600">
                    📊 진행률: {project.progress}%
                  </p>
                  <p className="text-gray-600">🗓 마감일: {project.dueDate}</p>
                </li>
              ))}
            </ul>
          </div>
          {/* 콘텐츠 영역 */}
          <div className="mt-auto">
            <button
              onClick={handleNavigate}
              className="w-full py-2 bg-blue-500 text-white rounded cursor-pointer"
            >
              프로젝트 현황
            </button>
          </div>
        </div>
      </div>

      {/* 칸반 보드 영역 */}
      <div
        className={`flex-grow p-8  mt-10 transition-all duration-300 ${isSidebarOpen ? "ml-80" : ""}`}
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
