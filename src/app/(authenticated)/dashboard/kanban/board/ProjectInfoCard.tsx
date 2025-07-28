import React from "react";
import { Progress } from "@/components/ui/progress";
import { convertDateToString } from "@/lib/utils/helpers";

interface ProjectInfoCardProps {
  projectName?: string;
  managerName?: string;
  deadline?: string;
  progress?: number;
  isPersonal?: boolean;
}

const ProjectInfoCard = ({
  projectName,
  managerName,
  deadline,
  progress = 0,
  isPersonal,
}: ProjectInfoCardProps) => {
  return (
    <div className="bg-[var(--box-bg)] p-4 rounded-xl mb-6 border border-[var(--border)] shadow-sm transition-all">
      {/* 프로젝트 제목 */}
      <div className="mb-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {projectName}
        </h2>
      </div>

      <div className="w-full space-y-2">
        {/* 담당자 + 마감일 */}
        <div className="text-sm text-[var(--sub-text)] flex flex-wrap items-center gap-x-1">
          <span>
            담당자: <span className="font-medium">{managerName}</span>
          </span>
          {!isPersonal && deadline && (
            <>
              <span className="mx-1">|</span>
              <span>
                마감일: {convertDateToString(new Date(deadline), "-")}
              </span>
            </>
          )}
        </div>

        {/* 진행률 */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-[var(--text-blur)]">진행률</p>
            <span className="text-sm text-[var(--text-base)] font-medium">
              {progress}%
            </span>
          </div>
          <Progress value={progress} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProjectInfoCard);
