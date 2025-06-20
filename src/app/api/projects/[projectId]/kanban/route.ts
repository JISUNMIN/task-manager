// app/api/projects/[projectId]/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 경로는 프로젝트에 따라 조정하세요

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = Number(params.projectId);

  if (isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  const tasks = await prisma.task.findMany({
    where: {
      projectId: projectId,
    },
    orderBy: {
      order: "asc",
    },
  });

  return NextResponse.json({ tasks });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = Number(params.projectId);
  const body = await req.json();

  const { title, desc, status, order, userId } = body;

  if (!title || !status || isNaN(projectId)) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const newTask = await prisma.task.create({
    data: {
      title,
      desc,
      status,
      order,
      userId,
      projectId,
    },
  });

  return NextResponse.json({ task: newTask }, { status: 201 });
}
