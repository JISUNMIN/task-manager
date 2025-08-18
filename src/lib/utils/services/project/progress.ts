// lib/utils/services/project/progress.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// prismaClient 타입: PrismaClient | Prisma.TransactionClient
export async function updateProjectProgress(
  projectId: number,
  prismaClient: PrismaClient | Prisma.TransactionClient = prisma
) {
  const result = await prismaClient.task.groupBy({
    by: ["status"],
    where: { projectId },
    _count: { status: true },
  });

  let total = 0;
  let completed = 0;

  result.forEach((r) => {
    total += r._count.status;
    if (r.status === "Completed") completed += r._count.status;
  });

  const progress = total === 0 ? 0 : Math.floor((completed / total) * 100);

  await prismaClient.project.update({
    where: { id: projectId },
    data: { progress },
  });

  return progress;
}
