"use client";
import React, { useState } from "react";
import ProjectCard from "./ProjectCard";
import useProjects from "@/hooks/useProjects";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";
import NewProjectCard from "./NewProjectCard";

const ProjectList = () => {
  const { listData } = useProjects();
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const onClickProject = (projectId: number) => {
    router.replace(`/dashboard/kanban?projectId=${projectId}`);
  };

  if (!listData) return <Loading />;

  return (
    <div className="mx-auto max-w-screen-lg p-6">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
        프로젝트 목록
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listData.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onClickProject(project.id)}
          />
        ))}

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
            className="h-55 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6  mb-3 cursor-pointer hover:bg-gray-100"
          >
            <span className="text-2xl text-gray-500">+</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
