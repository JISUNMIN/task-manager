import React from "react";
import { mockProjects } from "@/mocks/project";
import { logo } from "@/assets/images";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push("/projectlist");
  };

  return (
    <div
      className={`transition-transform transform  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-0 z-1`}
    >
      <div className="w-80 bg-green-50 p-4 h-full flex flex-col overflow-y-auto ">
        {/* 로고 */}
        <div className="flex justify-center mt-8">
          <Image src={logo} alt="Logo" width={150} height={300} />
        </div>
        <p className="text-2xl font-extrabold text-center text-gray-800 drop-shadow-md mb-2">
          Squirrel Board
        </p>
        <div>
          <ul>
            {mockProjects.map((project) => (
              <li
                className="mb-2 border-b border-gray-300 bg-gray-50 p-3 rounded-md shadow-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                key={project.name}
                onClick={() => console.log(`클릭한 프로젝트: ${project.name}`)}
              >
                <p className="font-semibold text-gray-700">
                  📌 프로젝트명: {project.name}
                </p>
                <p className="text-gray-600">👤 담당자: {project.manager}</p>
                <p className="text-gray-600">📊 진행률: {project.progress}%</p>
                <p className="text-gray-600">🗓 마감일: {project.dueDate}</p>
              </li>
            ))}
          </ul>
        </div>
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
  );
};

export default Sidebar;
