// /app/api/comments/[commentId]  → DELETE (comment 삭제)
// /app/api/comments/[commentId]   → PUT (comment 수정)

import { authenticate } from "@/lib/auth";
import { AuthError } from "@/lib/error";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  try {
    const { id, role } = authenticate(req);
    const { commentId } = await context.params;
    if (!commentId) {
      return NextResponse.json(
        { error: "commentId는 필수입니다." },
        { status: 400 }
      );
    }

    const targetComment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
      select: { id: true, userId: true },
    });

    if (!targetComment) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (role !== "ADMIN" && targetComment.userId !== id) {
      return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: Number(commentId) },
    });

    return NextResponse.json(
      { message: "댓글이 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

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
    const { id, role } = authenticate(req);
    const { commentId } = await context.params;
    const { comment } = await req.json();

    if (comment === undefined || comment === null) {
      return NextResponse.json(
        { error: "수정할 댓글 내용이 없습니다." },
        { status: 400 }
      );
    }

    const targetComment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
      select: { id: true, userId: true },
    });

    if (!targetComment) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (role !== "ADMIN" && targetComment.userId !== id) {
      return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });
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
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("comment 수정 에러:", error);
    return NextResponse.json(
      { error: "comment 수정에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
