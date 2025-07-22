// app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const taskId = searchParams.get("taskId");
    if (!taskId) {
      return NextResponse.json(
        { error: "taskId query parameter은 필수입니다." },
        { status: 400 }
      );
    }

    // taskId에 해당하는 댓글들(및 대댓글 포함) 모두 조회
    const comments = await prisma.comment.findMany({
      where: { taskId: Number(taskId), parentCommentId: null }, // 최상위 댓글만

      include: {
        user: {
          select: { id: true, userId: true, name: true, profileImage: true },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                userId: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Comment를 불러오는데 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { comment, userId, taskId, parentCommentId } = body;

    if (!comment || !userId || !taskId) {
      return NextResponse.json(
        { error: "comment, userId,taskId은 필수입니다." },
        { status: 400 }
      );
    }

    const newComment = await prisma.comment.create({
      data: {
        comment,
        userId,
        taskId,
        parentCommentId: parentCommentId ?? null,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Comment 생성에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
