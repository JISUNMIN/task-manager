"use client";
import React, { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import useProjects, { Project } from "@/hooks/react-query/useProjects";
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

const SortableItem = ({
  id,
  children,
}: {
  id: number;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const ProjectList = () => {
  const formInstance = useForm();
  const { user } = useAuthStore();
  const role = user?.role;
  const { listData, updateProjectOrder } = useProjects();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProjects, setEditableProjects] = useState<Project[]>([]);
  const [originalProjects, setOriginalProjects] = useState<Project[]>([]);
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
    router.replace(`/dashboard/kanban?projectId=${projectId}`);
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

  if (!listData) return <Loading />;

  const renderProjects = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {editableProjects.map((project) =>
        isEditing ? (
          <SortableItem key={project.id} id={project.id}>
            <ProjectCard
              project={project}
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

      {!isEditing && role === "ADMIN" && (
        <div>
          {isCreating ? (
            <NewProjectCard
              onCancel={() => setIsCreating(false)}
              onCreated={() => setIsCreating(false)}
            />
          ) : (
            <div
              onClick={() => setIsCreating(true)}
              className="h-55 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-3 cursor-pointer hover:bg-gray-100"
            >
              <span className="text-2xl text-gray-500">+</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <FormProvider {...formInstance}>
      <div className="mx-auto max-w-screen-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold text-gray-800">
            프로젝트 목록
          </h1>
          {isEditing ? (
            <div className="space-x-2">
              <Button onClick={onClickConfirmProjectOrder}>확인</Button>
              <Button
                variant="outline"
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
            <div className="text-gray-600 border rounded p-4 text-center mb-6">
              현재 할당된 팀 프로젝트가 없습니다.
              <br />
              개인 프로젝트를 이용하시거나, 관리자에게 프로젝트 할당을 요청해
              주세요.
            </div>
          )}

        {/* 프로젝트 카드 목록 */}
        {isEditing ? (
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
