// app/api/projects/[projectId]/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ALL_STATUS, status } from "@/store/useKanbanStore";

const defaultTasks = ALL_STATUS.reduce(
  (acc, stat) => {
    acc[stat] = [{ title: "", desc: "" }];
    return acc;
  },
  {} as Record<status, { title: string; desc: string }[]>
);

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  // 실제에선 projectId로 DB에서 조회
  return NextResponse.json({ projectId, columns: defaultTasks });
}
