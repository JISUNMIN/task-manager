import { authenticate } from "@/lib/auth";
import { AuthError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { id, role } = authenticate(req);
    const { userId } = await context.params;
    const numericUserId = Number(userId);

    if (role !== "ADMIN" && id !== numericUserId) {
      return NextResponse.json({ error: "조회 권한이 없습니다." }, { status: 403 });
    }

    const [managedProjectsCount, assignedTasks, completedTasksCount, overdueTasksCount, highPriorityTasksCount, recentActivityCount, personalProject, assignedProjects] =
      await Promise.all([
        prisma.project.count({
          where: { managerId: numericUserId },
        }),
        prisma.task.count({
          where: { assignees: { some: { id: numericUserId } } },
        }),
        prisma.task.count({
          where: {
            assignees: { some: { id: numericUserId } },
            status: "Completed",
          },
        }),
        prisma.task.count({
          where: {
            assignees: { some: { id: numericUserId } },
            dueDate: { lt: new Date() },
            status: { not: "Completed" },
          },
        }),
        prisma.task.count({
          where: {
            assignees: { some: { id: numericUserId } },
            priority: "HIGH",
            status: { not: "Completed" },
          },
        }),
        prisma.taskActivity.count({
          where: {
            actorId: numericUserId,
            createdAt: {
              gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
            },
          },
        }),
        prisma.project.findFirst({
          where: {
            managerId: numericUserId,
            isPersonal: true,
          },
          select: { id: true },
        }),
        prisma.project.findMany({
          where: {
            tasks: {
              some: {
                assignees: {
                  some: { id: numericUserId },
                },
              },
            },
          },
          select: {
            id: true,
            tasks: {
              where: {
                assignees: { some: { id: numericUserId } },
                status: { not: "Completed" },
              },
              select: { id: true },
            },
          },
        }),
      ]);

    const recommendedProject = assignedProjects
      .sort((a, b) => b.tasks.length - a.tasks.length)[0];

    return NextResponse.json({
      managedProjectsCount,
      assignedTasksCount: assignedTasks,
      completedTasksCount,
      overdueTasksCount,
      highPriorityTasksCount,
      recentActivityCount,
      personalProjectId: personalProject?.id ?? null,
      recommendedProjectId: recommendedProject?.id ?? personalProject?.id ?? null,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("GET /api/users/[userId]/summary 에러:", error);
    return NextResponse.json({ error: "요약 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}
