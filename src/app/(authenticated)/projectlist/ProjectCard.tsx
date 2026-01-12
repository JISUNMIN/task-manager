import React, { CSSProperties, FC, memo, useEffect, useMemo, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { ProjectLabel } from "@prisma/client";
import { convertDateToString, getDeadlineStatus } from "@/lib/utils/helpers";
import { useAuthStore } from "@/store/useAuthStore";
import { ClientProject } from "@/hooks/react-query/useProjects";
import { Badge } from "@/components/ui/badge";
import { GoVerified } from "react-icons/go";
import { cn } from "@/lib/utils";
import { ActionDropdownMenu } from "@/components/ui/extended/ActionDropdownMenu";
import { Calendar, Trash, User as UserIcon } from "lucide-react";
import { DEADLINE_COLOR_MAP, LABEL_COLOR_MAP, LABELS } from "@/app/constants/common";
import { DeleteDialog } from "@/components/ui/extended/DeleteDialog";
import { UserSelectionModal } from "@/components/ui/extended/UserSelectionModal ";
import { DeadlineModal } from "@/components/ui/extended/DeadlineModal";
import { UserAvatar } from "@/components/ui/extended/UserAvatar";
import { useThemeStore } from "@/store/useThemeStore";
import useProjectMutations from "@/hooks/react-query/useProjectMutations";
import { useFormContext, useWatch } from "react-hook-form";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjectCardProps {
  project: ClientProject;
  onClick: () => void;
  disabled?: boolean;
  isEditing?: boolean;
  isNavigating?: boolean;
}

const containerStyle: CSSProperties = {
  transformStyle: "preserve-3d",
  willChange: "transform",
};

const lightOverlayStyle: CSSProperties = {
  backgroundImage: `
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

const darkOverlayStyle: CSSProperties = {
  backgroundImage: `
    linear-gradient(
      105deg,
      transparent 40%,
      rgba(255, 180, 90, 0.25) 45%, 
      rgba(30, 60, 100, 0.3) 55%, 
      transparent 54%
    )
  `,
  backgroundSize: "150% 150%",
  backgroundPosition: "100%",
  backgroundRepeat: "no-repeat",
  filter: "brightness(0.5) opacity(0.5)",
};

const ProjectTitle: FC<{ title: string; className?: string }> = ({ title, className }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const [isOverflowed, setIsOverflowed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setIsOverflowed(el.scrollWidth > el.offsetWidth);
    }
  }, [title]);

  if (!isOverflowed)
    return (
      <h3 ref={ref} className={className}>
        {title}
      </h3>
    );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <h3 ref={ref} className={className}>
          {title}
        </h3>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs break-words">{title}</TooltipContent>
    </Tooltip>
  );
};

const ProjectCard: FC<ProjectCardProps> = memo(
  ({ project, onClick, disabled, isEditing, isNavigating }) => {
    const { control } = useFormContext();
    const { user } = useAuthStore();
    const userId = user?.id;
    const role = user?.role;
    const { theme } = useThemeStore();
    const [label, setLabel] = useState(project?.label ?? "feature");
    const labelClass = LABEL_COLOR_MAP[label];
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] = useState(false);
    const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
    const { managerId, deadline } = useWatch({ control });
    const { status: deadlineStatus, text: deadlineText } = getDeadlineStatus(
      new Date(project.deadline),
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const canDeleteProject =
      !project.isPersonal && (role === "ADMIN" || project.managerId === userId);

    const overlayStyle = useMemo(
      () => (theme === "light" ? lightOverlayStyle : darkOverlayStyle),
      [theme],
    );

    const { deleteProjectMutate, updateProjectLabel, updateProjectManager, updateProjecDeadline } =
      useProjectMutations(project.id);

    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const items = [
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
        variant: "destructive" as const,
        onSelect: () => setIsDeleteDialogOpen(true),
      },
    ];

    const handleSelectedLabel = (value: ProjectLabel) => {
      setLabel(value);
      updateProjectLabel({ label: value });
    };

    const onClickConfirmManagerChange = () => {
      updateProjectManager({ managerId });
    };

    const onClickDelete = () => {
      setIsDeleting(true);
      deleteProjectMutate(undefined, {
        onSettled: () => setIsDeleting(false),
      });
    };

    const onClickConfirmDeadline = () => {
      updateProjecDeadline({ deadline });
    };

    useEffect(() => {
      if (disabled) return;
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
    }, [disabled]);

    return (
      <>
        <div
          ref={containerRef}
          onClick={disabled || isNavigating ? undefined : onClick}
          className={cn(
            "relative h-55 rounded-lg p-6 shadow-md mb-3 transition-all duration-100 bg-[var(--bg-seonday)]",
            project.isPersonal
              ? "border-4 border-blue-400"
              : "border border-stone-300 dark:border-gray-600",
            !disabled && "hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 cursor-pointer",
            disabled && "cursor-not-allowed opacity-80",
            isNavigating && "pointer-events-none opacity-90",
          )}
          style={containerStyle}
        >
          {!disabled && (
            <div
              ref={overlayRef}
              className="absolute inset-0 z-10 pointer-events-none mix-blend-color-dodge rounded-lg"
              style={overlayStyle}
            />
          )}

          <div className="relative z-10">
            <div className="flex justify-between">
              <ProjectTitle
                title={project.projectName}
                className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate"
              />
              {canDeleteProject && !isEditing && (
                <ActionDropdownMenu
                  items={items}
                  labels={LABELS}
                  handleSelectedLabel={handleSelectedLabel}
                  project={project}
                />
              )}
            </div>

            <div className="text-sm text-[var(--foreground)] flex gap-1.5 items-center mt-1">
              담당자:
              <span className="flex items-center gap-1 font-medium">
                {project?.manager?.name}
                <span className="text-xs text-gray-500 dark:text-gray-300">
                  ({project?.manager?.userId})
                </span>
              </span>
              <UserAvatar
                src={project?.manager?.profileImage || undefined}
                alt={project?.manager?.userId}
                size="lg"
                className="mt-1"
              />
            </div>

            {!project.isPersonal && (
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-[var(--text-blur)]" />
                <p className="text-sm text-[var(--text-blur)]">
                  마감일: {convertDateToString(new Date(project.deadline), "-")}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <p className="text-sm text-[var(--text-blur)] mb-1">진행률</p>
              <span className="text-sm text-[var(--text-base)]">{project.progress}%</span>
            </div>
            <Progress value={project.progress} />
          </div>

          <div className="flex justify-end mt-5 relative z-10">
            {project.isPersonal ? (
              <Badge variant="secondary" className="bg-blue-500 text-white dark:bg-blue-600">
                <GoVerified />
                개인용
              </Badge>
            ) : (
              <div className="flex justify-between items-center w-full">
                <Badge
                  variant="outline"
                  className={`text-xs px-2 py-0.5 flex items-center gap-1 ${DEADLINE_COLOR_MAP[deadlineStatus]}`}
                >
                  {deadlineText}
                </Badge>
                {label && (
                  <Badge variant="secondary" className={labelClass}>
                    {label}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* 삭제 중 오버레이 */}
          {isDeleting && (
            <div className="absolute inset-0 z-20 bg-gray-900/30 dark:bg-black/40 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
              <svg
                className="animate-spin h-8 w-8 text-white mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span className="text-white font-semibold text-lg">삭제 중...</span>
            </div>
          )}

          {/* 이동 중 오버레이 */}
          {isNavigating && !isDeleting && (
            <div className="absolute inset-0 z-20 bg-gray-900/20 dark:bg-black/30 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
              <svg
                className="animate-spin h-8 w-8 text-white mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-white font-semibold text-lg">이동 중...</span>
            </div>
          )}
        </div>

        {/* 모달들 */}
        <UserSelectionModal
          name="managerId"
          open={isUserSelectionModalOpen}
          onOpenChange={setIsUserSelectionModalOpen}
          onConfirm={onClickConfirmManagerChange}
        />
        <DeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDelete={onClickDelete}
          title="정말 삭제하시겠습니까?"
          description="이 작업은 되돌릴 수 없습니다. 이 프로젝트가 완전히 삭제됩니다."
        />
        <DeadlineModal
          name="deadline"
          open={isDeadlineModalOpen}
          onOpenChange={setIsDeadlineModalOpen}
          onConfirm={onClickConfirmDeadline}
        />
      </>
    );
  },
);

export default ProjectCard;
