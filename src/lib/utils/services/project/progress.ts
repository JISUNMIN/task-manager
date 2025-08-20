// lib/utils/services/project/progress.ts
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function updateProjectProgress(
  projectId: number,
  progress: number,
  prismaClient: PrismaClient = prisma
) {
  await prismaClient.project.update({
    where: { id: projectId },
    data: { progress },
  });

  return progress;
}
