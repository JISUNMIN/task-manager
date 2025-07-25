"use client";
import React, { useState, useEffect, ReactNode } from "react";
import ProjectCard from "./ProjectCard";
import useProjects, { ClientProject } from "@/hooks/react-query/useProjects";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";
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
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useProjectMutations from "@/hooks/react-query/useProjectMutations";
import { CardSkeleton } from "@/components/ui/extended/Skeleton/CardSkeleton";

const SortableItem = ({
  id,
  children,
  disabled = false,
}: {
  id: number;
  children: ReactNode;
  disabled?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(disabled ? {} : listeners)}
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
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProjects, setEditableProjects] = useState<ClientProject[]>([]);
  const [originalProjects, setOriginalProjects] = useState<ClientProject[]>([]);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (listData) {
      const filtered = listData.filter((project) =>
        project.isPersonal ? project.manager.id === user?.id : true
      );
      setEditableProjects(filtered);
      setOriginalProjects(filtered);
    }
  }, [listData]);

  const onClickProject = (projectId: number) => {
    if (isEditing) return;
    setIsNavigating(true);
    router.push(`/dashboard/kanban?projectId=${projectId}`);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = editableProjects.findIndex((p) => p.id === active.id);
      const newIndex = editableProjects.findIndex((p) => p.id === over.id);
      setEditableProjects((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  const onClickConfirmProjectOrder = () => {
    setOriginalProjects(editableProjects);
    setIsEditing(false);
    updateProjectOrder({ projectIds: editableProjects.map((p) => p.id) });
  };

  if (!listData || isNavigating) return <Loading />;

  const renderProjects = () => (
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

      {editableProjects.map((project) =>
        isEditing ? (
          <SortableItem
            key={project.id}
            id={project.id}
            disabled={project.isPersonal}
          >
            <ProjectCard
              project={project}
              disabled={project.isPersonal}
              onClick={() => onClickProject(project.id)}
            />
          </SortableItem>
        ) : (
          <div key={project.id}>
            <ProjectCard
              project={project}
              onClick={() => onClickProject(project.id)}
            />
          </div>
        )
      )}
    </div>
  );

  return (
    <FormProvider {...formInstance}>
      <div className="mx-auto max-w-screen-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-4">
          <h1 className="text-3xl font-extrabold text-[var(--foreground)]">
            프로젝트 목록
          </h1>
          {isEditing ? (
            <div className="space-x-2">
              <Button onClick={onClickConfirmProjectOrder}>확인</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditableProjects(originalProjects);
                  setIsEditing(false);
                }}
              >
                취소
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              프로젝트 순서 변경
            </Button>
          )}
        </div>

        {/* 안내 메시지 */}
        {listData?.length === 1 &&
          listData[0].isPersonal &&
          role !== "ADMIN" && (
            <div className="text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded p-4 text-center mb-6">
              현재 할당된 팀 프로젝트가 없습니다.
              <br />
              개인 프로젝트를 이용하시거나, 관리자에게 프로젝트 할당을 요청해
              주세요.
            </div>
          )}
        {!editableProjects.length && !!listData.length ? (
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
              items={editableProjects.map((p) => p.id)}
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
