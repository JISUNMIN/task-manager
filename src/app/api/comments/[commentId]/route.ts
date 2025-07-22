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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await context.params;
    const { comment } = await req.json();

    console.log("comment확인", comment);

    if (comment === undefined || comment === null) {
      return NextResponse.json(
        { error: "수정할 댓글 내용이 없습니다." },
        { status: 400 }
      );
    }

    await prisma.comment.update({
      where: { id: Number(commentId) },
      data: {
        comment: comment,
      },
    });
    return NextResponse.json(
      { message: "댓글이 수정되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("comment 수정 에러:", error);
    return NextResponse.json(
      { error: "comment 수정에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
