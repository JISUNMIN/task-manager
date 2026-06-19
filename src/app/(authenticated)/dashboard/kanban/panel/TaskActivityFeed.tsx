"use client";

import { UserAvatar } from "@/components/ui/extended/UserAvatar";
import useTaskHistory from "@/hooks/react-query/useTaskHistory";
import { getTimeAgo } from "@/lib/utils/helpers";

type Props = {
  taskId: number;
};

export function TaskActivityFeed({ taskId }: Props) {
  const { history, isLoading } = useTaskHistory(taskId);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--box-bg)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-base)]">작업 히스토리</h3>
        <span className="text-xs text-[var(--text-blur)]">
          최근 {history?.length ?? 0}건
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--text-blur)]">활동 로그를 불러오는 중입니다.</p>
      ) : history && history.length > 0 ? (
        <div className="max-h-[240px] space-y-3 overflow-y-auto pr-1">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-third)]/50 p-3"
            >
              <UserAvatar
                src={item.actor?.profileImage ?? undefined}
                alt={item.actor?.name ?? "System"}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-[var(--text-base)]">
                    {item.actor?.name ?? "시스템"}
                  </span>
                  <span className="rounded-full bg-[var(--btn-hover-bg)] px-2 py-0.5 text-xs text-[var(--text-base)]">
                    {item.label}
                  </span>
                  <span className="text-xs text-[var(--text-blur)]">{getTimeAgo(item.createdAt)}</span>
                </div>
                {(item.fromValue || item.toValue) && (
                  <p className="mt-1 break-words text-sm text-[var(--text-base)]">
                    {item.fieldLabel ? `${item.fieldLabel}: ` : ""}
                    <span className="text-[var(--text-blur)]">{item.fromValue ?? "비어 있음"}</span>
                    {" -> "}
                    <span className="font-medium">{item.toValue ?? "비어 있음"}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-blur)]">아직 기록된 작업 히스토리가 없습니다.</p>
      )}
    </div>
  );
}
