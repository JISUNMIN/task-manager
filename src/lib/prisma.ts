// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
    // @ts-ignore
    __internal: {
      engine: {
        connectTimeout: 10000,
        queryTimeout: 30000,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function checkConnection() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const time = Date.now() - start;
    console.log(`🟢 Supabase 연결: ${time}ms`);
    return { connected: true, time };
  } catch (error) {
    const time = Date.now() - start;
    console.error(`🔴 연결 실패 (${time}ms):`, error);
    return { connected: false, time, error };
  }
}
