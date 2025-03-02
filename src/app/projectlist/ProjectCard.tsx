import React from "react";

interface ProjectCardProps {
  project: {
    name: string;
    manager: string;
    progress: number;
    dueDate: string;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 shadow-md cursor-pointer mb-3 hover:bg-gray-200 hover:border-gray-400 hover:scale-105 transition-all">
      <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
      <p className="text-sm text-gray-600">담당자: {project.manager}</p>
      <p className="text-sm text-gray-600">진행률: {project.progress}%</p>
      <p className="text-sm text-gray-600">마감일: {project.dueDate}</p>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
        <div
          className="h-full bg-green-300 rounded-full"
          style={{ width: `${project.progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProjectCard;
