// app/api/comments/route.ts
import { authenticate } from "@/lib/auth";
import { AuthError } from "@/lib/error";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { id, role } = authenticate(req);
    const { searchParams } = new URL(req.url);

    const taskId = searchParams.get("taskId");
    if (!taskId) {
      return NextResponse.json(
        { error: "taskId query parameter은 필수입니다." },
        { status: 400 }
      );
    }

    // taskId에 해당하는 댓글들(및 대댓글 포함) 모두 조회
    const task = await prisma.task.findUnique({
      where: { id: Number(taskId) },
      include: {
        project: true,
        assignees: {
          select: { id: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task를 찾을 수 없습니다." }, { status: 404 });
    }

    const canAccess =
      role === "ADMIN" ||
      task.project.managerId === id ||
      task.assignees.some((assignee) => assignee.id === id);

    if (!canAccess) {
      return NextResponse.json({ error: "조회 권한이 없습니다." }, { status: 403 });
    }

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
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Comment를 불러오는데 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, role } = authenticate(req);
    const body = await req.json();

    const { comment, taskId, parentCommentId } = body;

    if (!comment || !taskId) {
      return NextResponse.json(
        { error: "comment, taskId은 필수입니다." },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: Number(taskId) },
      include: {
        project: true,
        assignees: {
          select: { id: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task를 찾을 수 없습니다." }, { status: 404 });
    }

    const canAccess =
      role === "ADMIN" ||
      task.project.managerId === id ||
      task.assignees.some((assignee) => assignee.id === id);

    if (!canAccess) {
      return NextResponse.json({ error: "작성 권한이 없습니다." }, { status: 403 });
    }

    const newComment = await prisma.comment.create({
      data: {
        comment,
        userId: id,
        taskId,
        parentCommentId: parentCommentId ?? null,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Comment 생성에 실패했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
