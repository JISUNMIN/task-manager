// app/api/projects/[projectId]/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  // 실제에선 projectId로 DB에서 조회
  return NextResponse.json({ projectId, columns: "" });
}
