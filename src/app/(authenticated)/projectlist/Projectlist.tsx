"use client";
import React from "react";
import ProjectCard from "./ProjectCard";
import useProjects from "@/hooks/useProjects";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";

const ProjectList = () => {
  const { listData } = useProjects();
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
        {listData?.map((project, index) => (
          <ProjectCard
            key={index}
            project={project}
            onClick={() => onClickProject(project.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
