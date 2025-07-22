// /app/api/comments/[commentId]  → DELETE (comment 삭제)
// /app/api/comments/[commentId]   → PUT (comment 수정)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await context.params;
    if (!commentId) {
      return NextResponse.json(
        { error: "commentId는 필수입니다." },
        { status: 400 }
      );
    }
    await prisma.comment.delete({
      where: { id: Number(commentId) },
    });

    return NextResponse.json(
      { message: "댓글이 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Comment 삭제 에러:", error);
    return NextResponse.json(
      { error: "Comment 삭제에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
