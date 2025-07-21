// lib/utils/services/project/progress.ts
import { prisma } from "@/lib/prisma";

export async function updateProjectProgress(projectId: number) {
  const total = await prisma.task.count({ where: { projectId } });
  const completed = await prisma.task.count({
    where: {
      projectId,
      status: "Completed",
    },
  });

  const progress = total === 0 ? 0 : Math.floor((completed / total) * 100);

  await prisma.project.update({
    where: { id: projectId },
    data: { progress },
  });

  return progress;
}
