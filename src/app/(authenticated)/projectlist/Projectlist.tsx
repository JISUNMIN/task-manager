"use client";
import React, { useState } from "react";
import ProjectCard from "./ProjectCard";
import useProjects from "@/hooks/useProjects";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";
import NewProjectCard from "./NewProjectCard";
import { useAuthStore } from "@/store/useAuthStore";
import { FormProvider, useForm } from "react-hook-form";

const ProjectList = () => {
  const formInstance = useForm();
  const { user } = useAuthStore();
  const role = user?.role;
  const { listData } = useProjects();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const router = useRouter();
  // 관리자가 아니고 default 개인 프로젝트만 1개 있는 경우
  const showNoTeamProjectMessage =
    listData?.length === 1 &&
    listData[0]?.isPersonal === true &&
    role !== "ADMIN";

  //  개인 프로젝트는 자기 것만 보이도록 필터링
  const filteredProjects = listData?.filter((project) => {
    if (project.isPersonal) {
      return project?.manager.id === user?.id;
    }
    return true;
  });

  const onClickProject = (projectId: number) => {
    router.replace(`/dashboard/kanban?projectId=${projectId}`);
  };

  if (!listData) return <Loading />;
  return (
    <FormProvider {...formInstance}>
      <div className="mx-auto max-w-screen-xl p-6">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
          프로젝트 목록
        </h1>

        {/* 안내 메시지 */}
        {showNoTeamProjectMessage && (
          <div className="text-gray-600 border rounded p-4 text-center mb-6">
            현재 할당된 팀 프로젝트가 없습니다.
            <br />
            개인 프로젝트를 이용하시거나, 관리자에게 프로젝트 할당을 요청해
            주세요.
          </div>
        )}

        {/* 프로젝트 카드 목록 (항상 렌더링) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProjects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onClickProject(project.id)}
            />
          ))}

          {/* ADMIN만 새 프로젝트 생성 가능 */}
          {role === "ADMIN" && (
            <div>
              {isCreating ? (
                <NewProjectCard
                  onCancel={() => setIsCreating(false)}
                  onCreated={() => {
                    setIsCreating(false);
                  }}
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
      </div>
    </FormProvider>
  );
};

export default ProjectList;
