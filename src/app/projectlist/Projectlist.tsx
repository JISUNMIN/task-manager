import React from "react";
import ProjectCard from "./ProjectCard";
import { getMockData } from "@/mocks/project";

const ProjectList = () => {
  const mockProjects = getMockData();

  return (
    <div className="mx-auto max-w-screen-lg p-6">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
        프로젝트 목록
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
