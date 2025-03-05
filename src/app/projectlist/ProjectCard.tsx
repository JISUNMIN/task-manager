import React from "react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      <div className="text-sm text-gray-600 flex gap-1.5 items-center">
        담당자: {project.manager}
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
      <p className="text-sm text-gray-600">진행률: {project.progress}%</p>
      <p className="text-sm text-gray-600">마감일: {project.dueDate}</p>
      <Progress value={project.progress} className="mt-4" />
    </div>
  );
};

export default ProjectCard;
