import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// 전역 prisma 사용 (트랜잭션 없이 호출할 때)
export async function updateProjectProgress(projectId: number) {
  return updateProjectProgressTx(projectId, prisma);
}

// 트랜잭션 클라이언트를 명시적으로 받는 내부 함수
export async function updateProjectProgressTx(
  projectId: number,
  prismaClient: PrismaClient | Prisma.TransactionClient
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
