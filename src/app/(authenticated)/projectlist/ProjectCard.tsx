import React, { useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Project, User } from "@prisma/client";
import { IoPersonCircle } from "react-icons/io5";
import { convertDateToString } from "@/lib/utils/helpers";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import useProjects from "@/hooks/useProjects";
import { Badge } from "@/components/ui/badge";
import { GoVerified } from "react-icons/go";

interface ProjectCardProps {
  project: {
    id: number;
    projectName: string;
    managerId?: number;
    progress: number;
    deadline: string;
    manager: User;
    isPersonal: boolean;
  };
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { user } = useAuthStore();
  const userId = user?.id;
  const role = user?.role;
  const canDeleteProject =
    !project.isPersonal && (role === "ADMIN" || project.managerId === userId);
  const { deleteProjectMutate } = useProjects();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const onClickDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    deleteProjectMutate({ id: project.id });
  };

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateY = (-1 / 5) * x + 20;
      const rotateX = (4 / 30) * y - 20;

      // container.style.transform = `
      //   perspective(350px)
      //   rotateX(${rotateX}deg)
      //   rotateY(${rotateY}deg)
      // `;

      overlay.style.backgroundPosition = `${x / 5}% ${y / 5}%`;
    };

    const handleMouseLeave = () => {
      container.style.transform = ""; 
      overlay.style.backgroundPosition = "";
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`h-55 rounded-lg p-6 shadow-md cursor-pointer mb-3 border transition-all duration-100
        ${
          project.isPersonal
            ? "bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-gray-400 hover:scale-105"
            : "bg-white border-stone-300 hover:bg-gray-100 hover:border-stone-400 hover:scale-105"
        }
      `}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 z-10 pointer-events-none mix-blend-color-dodge rounded-lg"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,219,112,0.8) 45%, rgba(132,50,255,0.6) 50%, transparent 54%)",
          filter: "brightness(1.2) opacity(0.8)",
          backgroundSize: "150% 150%",
          backgroundPosition: "100%",
        }}
      />
      <div className="relative z-10 h-30">
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
        {!project.isPersonal && (
          <p className="text-sm text-gray-600">
            마감일: {convertDateToString(new Date(project.deadline), "-")}
          </p>
        )}
        <Progress value={project.progress} className="mt-4" />
      </div>

      <div className="flex justify-end mt-5 relative z-10">
        {canDeleteProject && <Button onClick={onClickDelete}>삭제</Button>}
        {project.isPersonal && (
          <Badge
            variant="secondary"
            className="bg-blue-500 text-white dark:bg-blue-600"
          >
            <GoVerified />
            개인용
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
