import React, { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectLabel, User } from "@prisma/client";
import { IoPersonCircle } from "react-icons/io5";
import { convertDateToString } from "@/lib/utils/helpers";
import { useAuthStore } from "@/store/useAuthStore";
import useProjects from "@/hooks/useProjects";
import { Badge } from "@/components/ui/badge";
import { GoVerified } from "react-icons/go";
import { cn } from "@/lib/utils";
import { ActionDropdownMenu } from "@/components/ui/extended/ActionDropdownMenu";
import { Calendar, Trash, User as UserIcon } from "lucide-react";
import { LABEL_COLOR_MAP, LABELS } from "@/app/constants/common";

interface ProjectCardProps {
  project: {
    id: number;
    projectName: string;
    managerId?: number;
    progress: number;
    deadline: string;
    manager: User;
    isPersonal: boolean;
    label?: ProjectLabel;
  };
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { user } = useAuthStore();
  const userId = user?.id;
  const role = user?.role;
  const canDeleteProject =
    !project.isPersonal && (role === "ADMIN" || project.managerId === userId);
  const { deleteProjectMutate, updateProjectLabel } = useProjects();
  const [label, setLabel] = useState(project?.label ?? "feature");
  const labelClass = LABEL_COLOR_MAP[label];

  const itmes = [
    ...(role === "ADMIN"
      ? [
          {
            label: "담당자 지정",
            icon: <UserIcon />,
            onSelect: () => console.log("Assign"),
          },
        ]
      : []),
    {
      label: "마감일 설정",
      icon: <Calendar />,
      onSelect: () => console.log("Set due date"),
    },
    {
      label: "삭제",
      icon: <Trash />,
      className: "text-red-600 ",
      onSelect: () => console.log("Delete"),
      shortcut: "⌘⌫",
    },
  ];

  const onClickDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    deleteProjectMutate({ id: project.id });
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      overlay.style.backgroundPosition = `${x / 5}% ${y / 5}%`;
    };

    const handleMouseLeave = () => {
      overlay.style.backgroundPosition = "";
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleSelectedLabel = (value: ProjectLabel) => {
    setLabel(value);
    updateProjectLabel({ id: project.id, label: value });
  };

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={cn(
        "relative h-55 rounded-lg p-6 shadow-md cursor-pointer mb-3 transition-all duration-100 bg-white hover:bg-gray-100 hover:scale-105",
        project.isPersonal
          ? "border-4 border-blue-400 hover:border-blue-500"
          : "border border-stone-300 hover:border-stone-400"
      )}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 z-10 pointer-events-none mix-blend-color-dodge rounded-lg"
        style={{
          background: `
      linear-gradient(
        105deg,
        transparent 40%,
        rgba(255, 225, 130, 0.9) 45%,
        rgba(100, 200, 255, 0.9) 50%,
        transparent 54%
      )`,
          filter: "brightness(1.2) opacity(0.8)",
          backgroundSize: "150% 150%",
          backgroundPosition: "100%",
        }}
      />
      <div className="relative z-10">
        <div className="flex justify-between">
          <h3 className="text-xl font-semibold text-gray-800">
            {project.projectName}
          </h3>
          {canDeleteProject && (
            <ActionDropdownMenu
              items={itmes}
              labels={LABELS}
              handleSelectedLabel={handleSelectedLabel}
            />
          )}
        </div>
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
        {/* <Button onClick={onClickDelete}>삭제</Button> */}
        {project.isPersonal ? (
          <Badge
            variant="secondary"
            className="bg-blue-500 text-white dark:bg-blue-600"
          >
            <GoVerified />
            개인용
          </Badge>
        ) : (
          label && (
            <Badge variant="secondary" className={labelClass}>
              {label}
            </Badge>
          )
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
