// lib/utils/services/project/progress.ts
import { prisma } from "@/lib/prisma";

export async function updateProjectProgress(projectId: number) {
  const result = await prisma.task.groupBy({
    by: ["status"],
    where: { projectId },
    _count: { status: true },
  });

  let total = 0;
  let completed = 0;

  result.forEach((r) => {
    total += r._count.status;
    if (r.status === "Completed") completed = r._count.status;
  });

  const progress = total === 0 ? 0 : Math.floor((completed / total) * 100);

  await prisma.project.update({
    where: { id: projectId },
    data: { progress },
  });

  return progress;
}
