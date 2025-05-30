// app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";

const comments: { [key: string]: string[] } = {}; // project-task 기준으로 저장

export async function POST(req: NextRequest) {
  const { projectId, taskTitle, comment } = await req.json();
  const key = `${projectId}:${taskTitle}`;
  if (!comments[key]) comments[key] = [];
  comments[key].push(comment);
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const taskTitle = searchParams.get("taskTitle");
  const key = `${projectId}:${taskTitle}`;
  return NextResponse.json({ comments: comments[key] || [] });
}
