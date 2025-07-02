import React from "react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Project, User } from "@prisma/client";
import { IoPersonCircle } from "react-icons/io5";
import { convertDateToString } from "@/lib/utils/helpers";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import useProjects from "@/hooks/useProjects";

interface ProjectCardProps {
  project: {
    id: number;
    projectName: string;
    managerId?: number;
    progress: number;
    deadline: string;
    manager: User;
  };
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { user } = useAuthStore();
  const userId = user?.id;
  const role = user?.role;
  const canDeleteProject = role === "ADMIN" || project.managerId === userId;
  const { deleteProjectMutate } = useProjects();

  const onClickDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    deleteProjectMutate({ id: project.id });
  };

  return (
    <div
      onClick={onClick}
      className="h-55 bg-gray-100 border border-gray-300 rounded-lg p-6 shadow-md cursor-pointer mb-3 hover:bg-gray-200 hover:border-gray-400 hover:scale-105 transition-all"
    >
      <h3 className="text-xl font-semibold text-gray-800">
        {project.projectName}
      </h3>
      <div className="text-sm text-gray-600 flex gap-1.5 items-center">
        담당자: {project?.manager?.name}
        <Avatar>
          <AvatarImage src={project?.manager?.profileImage ?? ""} />
          <AvatarFallback>
            <IoPersonCircle className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
      </div>
      <p className="text-sm text-gray-600">진행률: {project.progress}%</p>
      <p className="text-sm text-gray-600">
        마감일: {convertDateToString(new Date(project.deadline), "-")}
      </p>
      <Progress value={project.progress} className="mt-4" />

      <div className="flex justify-end mt-5">
        {canDeleteProject && <Button onClick={onClickDelete}>삭제</Button>}
      </div>
    </div>
  );
};

export default ProjectCard;
