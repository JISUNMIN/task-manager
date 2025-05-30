// app/api/projects/route.ts
import { NextResponse } from "next/server";

const projects = [
  { id: "project-1", name: "Project One" },
  { id: "project-2", name: "Project Two" },
];

export async function GET() {
  return NextResponse.json(projects);
}
