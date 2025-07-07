import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectLabel, User } from "@prisma/client";
import { IoPersonCircle } from "react-icons/io5";
import { convertDateToString } from "@/lib/utils/helpers";
import { useAuthStore } from "@/store/useAuthStore";
import useProjects from "@/hooks/react-query/useProjects";
import { Badge } from "@/components/ui/badge";
import { GoVerified } from "react-icons/go";
import { cn } from "@/lib/utils";
import { ActionDropdownMenu } from "@/components/ui/extended/ActionDropdownMenu";
import { Calendar, Trash, User as UserIcon } from "lucide-react";
import { LABEL_COLOR_MAP, LABELS } from "@/app/constants/common";
import { DeleteProjectDialog } from "@/components/ui/extended/DeleteProjectDialog";
import { UserSelectionModal } from "@/components/ui/extended/UserSelectionModal ";
import { useFormContext, useWatch } from "react-hook-form";
import { DeadlineModal } from "@/components/ui/extended/DeadlineModal";

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

const containerStyle: CSSProperties = {
  transformStyle: "preserve-3d",
  willChange: "transform",
};

const overlayStyle: CSSProperties = {
  background: `
    linear-gradient(
      105deg,
      transparent 40%,
      rgba(255, 225, 130, 0.9) 45%,
      rgba(100, 200, 255, 0.9) 50%,
      transparent 54%
    )
  `,
  filter: "brightness(1.2) opacity(0.8)",
  backgroundSize: "150% 150%",
  backgroundPosition: "100%",
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { control } = useFormContext();
  const { user } = useAuthStore();
  const userId = user?.id;
  const role = user?.role;
  const canDeleteProject =
    !project.isPersonal && (role === "ADMIN" || project.managerId === userId);
  const [label, setLabel] = useState(project?.label ?? "feature");
  const labelClass = LABEL_COLOR_MAP[label];
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] =
    useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const { managerId, deadline } = useWatch({ control });
  const {
    deleteProjectMutate,
    updateProjectLabel,
    updateProjectManager,
    updateProjecDeadline,
  } = useProjects(project.id);

  const itmes = [
    ...(role === "ADMIN"
      ? [
          {
            label: "담당자 지정",
            icon: <UserIcon />,
            onSelect: () => setIsUserSelectionModalOpen(true),
          },
        ]
      : []),
    {
      label: "마감일 설정",
      icon: <Calendar />,
      onSelect: () => setIsDeadlineModalOpen(true),
    },
    {
      label: "삭제",
      icon: <Trash />,
      variant: "destructive",
      onSelect: () => setIsDeleteDialogOpen(true),
    },
  ];

  const onClickConfirmManagerChange = () => {
    updateProjectManager({ managerId });
  };

  const onClickDelete = () => {
    deleteProjectMutate();
  };

  const onClickConfirmDeadline = () => {
    updateProjecDeadline({ deadline });
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
    updateProjectLabel({ label: value });
  };

  return (
    <>
      <div
        ref={containerRef}
        onClick={onClick}
        className={cn(
          "relative h-55 rounded-lg p-6 shadow-md cursor-pointer mb-3 transition-all duration-100 bg-white hover:bg-gray-100 hover:scale-105",
          project.isPersonal
            ? "border-4 border-blue-400 hover:border-blue-500"
            : "border border-stone-300 hover:border-stone-400"
        )}
        style={containerStyle}
      >
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 pointer-events-none mix-blend-color-dodge rounded-lg"
          style={overlayStyle}
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
                project={project}
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

      <UserSelectionModal
        name="managerId"
        open={isUserSelectionModalOpen}
        onOpenChange={setIsUserSelectionModalOpen}
        onConfirm={onClickConfirmManagerChange}
      />
      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={onClickDelete}
      />
      <DeadlineModal
        name="deadline"
        open={isDeadlineModalOpen}
        onOpenChange={setIsDeadlineModalOpen}
        onConfirm={onClickConfirmDeadline}
      />
    </>
  );
};

export default ProjectCard;
