// app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";

interface Comment {
  id: number;
  text: string;
  parentId: number | null;
}

const comments: { [key: string]: Comment[] } = {}; // project-task 기준 저장
let idCounter = 1;

export async function POST(req: NextRequest) {
  const { projectId, taskTitle, text, parentId } = await req.json();
  const key = `${projectId}:${taskTitle}`;

  if (!comments[key]) comments[key] = [];

  const newComment: Comment = {
    id: idCounter++,
    text,
    parentId: parentId ?? null,
  };

  comments[key].push(newComment);

  return NextResponse.json({ success: true, comment: newComment });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const taskTitle = searchParams.get("taskTitle");
  const key = `${projectId}:${taskTitle}`;

  const allComments = comments[key] || [];

  return NextResponse.json({ comments: allComments });
}
