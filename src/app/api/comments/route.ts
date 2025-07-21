// app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // prisma 클라이언트 import 경로에 맞게 수정하세요

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    if (!taskId) {
      return NextResponse.json(
        { error: "taskId query parameter is required" },
        { status: 400 }
      );
    }

    // taskId에 해당하는 댓글들(및 대댓글 포함) 모두 조회 (필요에 따라 정렬 추가 가능)
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

    console.log("뭔데", JSON.stringify(comments));

    return NextResponse.json(comments);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { comment, userId, taskId, parentCommentId } = body;

    if (!comment || !userId || !taskId) {
      return NextResponse.json(
        { error: "comment, userId, and taskId are required" },
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
      { error: "Internal Server Error", detail: String(error) },
      { status: 500 }
    );
  }
}
