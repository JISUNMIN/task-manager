import React from "react";
import ProjectCard from "./ProjectCard";

const projects = [
  {
    name: "프로젝트 A",
    manager: "홍길동",
    progress: 75,
    dueDate: "2025-03-10",
  },
  {
    name: "프로젝트 B",
    manager: "김철수",
    progress: 50,
    dueDate: "2025-04-15",
  },
  {
    name: "프로젝트 C",
    manager: "이영희",
    progress: 30,
    dueDate: "2025-05-01",
  },
  {
    name: "프로젝트 D",
    manager: "김지수",
    progress: 75,
    dueDate: "2025-06-20",
  },
];

const ProjectList = () => {
  return (
    <div className="mx-auto max-w-screen-lg p-6">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
        프로젝트 목록
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
