"use client";
import React, { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import useProjects from "@/hooks/react-query/useProjects";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";
import NewProjectCard from "./NewProjectCard";
import { useAuthStore } from "@/store/useAuthStore";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ProjectList = () => {
  const formInstance = useForm();
  const { user } = useAuthStore();
  const role = user?.role;
  const { listData } = useProjects();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProjects, setEditableProjects] = useState<any[]>([]);
  const [originalProjects, setOriginalProjects] = useState<any[]>([]);
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
    if (isEditing) return; // 편집 모드에서는 이동 방지
    router.replace(`/dashboard/kanban?projectId=${projectId}`);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const newItems = [...editableProjects];
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    setEditableProjects(newItems);
  };

  if (!listData) return <Loading />;

  return (
    <FormProvider {...formInstance}>
      <div className="mx-auto max-w-screen-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold text-gray-800">
            프로젝트 목록
          </h1>
          {isEditing ? (
            <div className="space-x-2">
              <Button
                onClick={() => {
                  console.log(
                    "정렬 저장됨:",
                    editableProjects.map((p) => p.id)
                  );
                  setOriginalProjects(editableProjects);
                  setIsEditing(false);
                }}
              >
                확인
              </Button>
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects" direction="vertical">
            {(provided) => (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {editableProjects?.map((project, index) => (
                  <Draggable
                    key={project.id}
                    draggableId={project.id.toString()}
                    index={index}
                    isDragDisabled={!isEditing}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ProjectCard
                          project={project}
                          onClick={() => onClickProject(project.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}

                {/* ADMIN만 새 프로젝트 생성 가능 */}
                {role === "ADMIN" && !isEditing && (
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

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </FormProvider>
  );
};

export default ProjectList;
