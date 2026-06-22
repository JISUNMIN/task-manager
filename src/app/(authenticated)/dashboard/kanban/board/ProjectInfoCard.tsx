"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { convertDateToString } from "@/lib/utils/helpers";
import { User } from "@prisma/client";

interface ProjectInfoCardProps {
  projectName?: string;
  manager?: User;
  deadline?: string;
  progress?: number;
  isPersonal?: boolean;
  completedCount?: number;
  totalCount?: number;
}

const ProjectInfoCard = ({
  projectName,
  manager,
  deadline,
  progress = 0,
  isPersonal,
  completedCount = 0,
  totalCount = 0,
}: ProjectInfoCardProps) => {
  return (
    <div className="app-surface mb-6 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_18px_34px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.02)]">
      {/* 프로젝트 제목 */}
      <h2 className="mb-3 text-xl font-bold md:text-2xl">
        {projectName}
      </h2>

      {/* 담당자 + 마감일 */}
      <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--text-blur)]">
        <span>
          담당자: <span className="font-medium">{manager?.name}</span>{" "}
          <span className="text-xs text-gray-500 dark:text-gray-300">
            ({manager?.userId})
          </span>
        </span>
        {!isPersonal && deadline && (
          <>
            <span className="mx-1">|</span>
            <span>마감일: {convertDateToString(new Date(deadline), "-")}</span>
          </>
        )}
      </div>

      {/* 진행률 + 완료/전체 */}
      <div className="mb-2">
        {/* 완료/전체 배지 */}
        <div className="mb-2 flex items-center justify-between">
          <span className="app-tag border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)]">
            {completedCount} / {totalCount}
          </span>
          <span className="text-sm font-medium text-[var(--text-base)]">
            {progress}%
          </span>
        </div>
        {/* Progress Bar */}
        <Progress value={progress} className="h-2 rounded-full" />
      </div>
    </div>
  );
};

export default React.memo(ProjectInfoCard);
