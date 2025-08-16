"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { convertDateToString } from "@/lib/utils/helpers";

interface ProjectInfoCardProps {
  projectName?: string;
  managerName?: string;
  deadline?: string;
  progress?: number;
  isPersonal?: boolean;
  completedCount?: number;
  totalCount?: number;
}

const ProjectInfoCard = ({
  projectName,
  managerName,
  deadline,
  progress = 0,
  isPersonal,
  completedCount = 0,
  totalCount = 0,
}: ProjectInfoCardProps) => {
  return (
    <div className="bg-[var(--box-bg)] p-5 rounded-xl mb-6 border border-[var(--border)] shadow-sm transition-all">
      {/* 프로젝트 제목 */}
      <h2 className="text-2xl font-bold mb-3">{projectName}</h2>

      {/* 담당자 + 마감일 */}
      <div className="text-sm text-[var(--sub-text)] flex flex-wrap items-center gap-x-1 mb-4">
        <span>
          담당자: <span className="font-medium">{managerName}</span>
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
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-300 rounded-full px-3 py-0.5 border border-gray-300">
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
