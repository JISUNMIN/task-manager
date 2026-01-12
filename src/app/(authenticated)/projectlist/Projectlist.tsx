"use client";
import React, { useState, useEffect, ReactNode, useRef } from "react";
import ProjectCard from "./ProjectCard";
import useProjects, { ClientProject } from "@/hooks/react-query/useProjects";
import { useRouter } from "next/navigation";
import NewProjectCard from "./NewProjectCard";
import { useAuthStore } from "@/store/useAuthStore";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useProjectMutations from "@/hooks/react-query/useProjectMutations";
import { CardSkeleton } from "@/components/ui/extended/Skeleton/CardSkeleton";

import { LABELS, LABEL_COLOR_MAP } from "@/app/constants/common";
import { cn } from "@/lib/utils";
import { Filter, Loader2Icon } from "lucide-react";

const SortableItem = ({
  id,
  children,
  disabled = false,
}: {
  id: number;
  children: ReactNode;
  disabled?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...(!disabled && listeners)}
    >
      {children}
    </div>
  );
};

const ProjectList = () => {
  const formInstance = useForm();
  const { user } = useAuthStore();
  const role = user?.role;
  const { listData } = useProjects();
  const { updateProjectOrder } = useProjectMutations();

  const [editableProjects, setEditableProjects] = useState<ClientProject[]>([]);
  const originalProjectsRef = useRef<ClientProject[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([...LABELS]);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();
  const filteredProjects = editableProjects.filter(
    (project) => project.isPersonal || selectedLabels.includes(project.label ?? "feature"),
  );

  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingProjectId, setNavigatingProjectId] = useState<number | null>(null);

  const noTeamProjects = listData?.length === 1 && listData[0].isPersonal && role !== "ADMIN";

  const noFilteredProjects =
    editableProjects.length > 0 && !filteredProjects.some((p) => !p.isPersonal);

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) => {
      const newSet = new Set(prev);
      newSet.has(label) ? newSet.delete(label) : newSet.add(label);
      return [...newSet];
    });
  };

  const onClickProject = (projectId: number) => {
    if (isEditing) return;
    if (isNavigating) return;

    setIsNavigating(true);
    setNavigatingProjectId(projectId);
    router.push(`/dashboard/kanban?projectId=${projectId}`);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = editableProjects.findIndex((p) => p.id === active.id);
      const newIndex = editableProjects.findIndex((p) => p.id === over.id);
      setEditableProjects((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  const onClickConfirmProjectOrder = () => {
    originalProjectsRef.current = editableProjects;
    setIsEditing(false);
    updateProjectOrder({ projectIds: editableProjects.map((p) => p.id) });
    setSelectedLabels([...LABELS]);
  };

  const onClickCancelProjectOrder = () => {
    setEditableProjects(originalProjectsRef.current);
    setIsEditing(false);
  };

  const handleResetClick = () => {
    setIsResetting(true);

    setTimeout(() => {
      setIsResetting(false);
    }, 500);

    setSelectedLabels([...LABELS]);
  };

  const renderLabelFilters = () => (
    <div className="flex gap-2 mb-4 flex-wrap items-center">
      {/* 필터 아이콘 */}
      <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <Filter className="w-4 h-4" />
      </div>

      {LABELS.map((label) => {
        const isSelected = selectedLabels.includes(label);
        const className = cn(
          "px-3 py-1 rounded-full text-sm font-semibold select-none transition-colors duration-200 cursor-pointer",
          isSelected
            ? LABEL_COLOR_MAP[label]
            : "border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400",
        );

        return (
          <span
            key={label}
            className={`
            rounded-full font-semibold select-none transition-colors duration-200
            px-2 py-0.5 text-xs        
            lg:px-3 lg:py-1 lg:text-sm ${className}`}
            onClick={() => toggleLabel(label)}
          >
            {label}
          </span>
        );
      })}

      {/* Reset 버튼 */}
      <Button
        className="px-3 text-xs lg:py-1 lg:text-sm rounded-full font-semibold select-none cursor-pointer border"
        onClick={handleResetClick}
      >
        {isResetting ? <Loader2Icon className="animate-spin" /> : "⟳"}
      </Button>
    </div>
  );

  const renderProjects = () => {
    const projectsToRender = isEditing ? editableProjects : filteredProjects;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {!isEditing && role === "ADMIN" && (
          <div
            className="h-55 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-3 cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
            onClick={() => setIsCreating(true)}
          >
            {isCreating ? (
              <div onClick={(e) => e.stopPropagation()}>
                <NewProjectCard
                  onCancel={() => setIsCreating(false)}
                  onCreated={() => setIsCreating(false)}
                />
              </div>
            ) : (
              <span className="text-2xl text-gray-500 dark:text-gray-300">+</span>
            )}
          </div>
        )}

        {projectsToRender.map((project) => {
          const card = (
            <ProjectCard
              project={project}
              isEditing={isEditing}
              disabled={isEditing && project.isPersonal}
              onClick={() => onClickProject(project.id)}
              isNavigating={navigatingProjectId === project.id}
            />
          );

          return isEditing ? (
            <SortableItem key={project.id} id={project.id} disabled={project.isPersonal}>
              {card}
            </SortableItem>
          ) : (
            <div key={project.id}>{card}</div>
          );
        })}
      </div>
    );
  };
  const renderActionButtons = () =>
    isEditing ? (
      <div className="space-x-2">
        <Button onClick={onClickConfirmProjectOrder}>확인</Button>
        <Button variant="secondary" onClick={onClickCancelProjectOrder}>
          취소
        </Button>
      </div>
    ) : (
      <Button onClick={() => setIsEditing(true)}>프로젝트 순서 변경</Button>
    );

  useEffect(() => {
    if (listData) {
      setEditableProjects(listData);
      originalProjectsRef.current = listData;
    }
  }, [listData]);

  return (
    <FormProvider {...formInstance}>
      <div className="mx-auto max-w-screen-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-4">
          <h1 className="text-3xl font-extrabold text-[var(--foreground)]">프로젝트 목록</h1>
          {renderActionButtons()}
        </div>

        {/* 라벨 필터 UI */}
        {!isEditing && renderLabelFilters()}

        {/* 안내 메시지 */}
        {!isEditing && noTeamProjects && (
          <div className="text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded p-4 text-center mb-6">
            현재 할당된 팀 프로젝트가 없습니다.
            <br />
            개인 프로젝트를 이용하시거나, 관리자에게 프로젝트 할당을 요청해 주세요.
          </div>
        )}

        {!isEditing && noFilteredProjects && (
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
            선택한 라벨에 해당하는 팀 프로젝트가 없습니다.
          </p>
        )}

        {!editableProjects.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isEditing ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredProjects.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              {renderProjects()}
            </SortableContext>
          </DndContext>
        ) : (
          renderProjects()
        )}
      </div>
    </FormProvider>
  );
};

export default ProjectList;
