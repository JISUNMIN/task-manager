// scripts/hashPasswords.ts
import { prisma } from "../lib/prisma.js";

import bcrypt from "bcrypt";

async function hashAllPasswords() {
  try {
    // 1) DB에서 모든 유저와 비밀번호 가져오기
    const users = await prisma.user.findMany({
      select: {
        id: true,
        password: true,
      },
    });

    for (const user of users) {
      // 2) 비밀번호가 이미 해시인지 판단 (bcrypt 해시는 길이 60 정도)
      if (user.password.length === 60) {
        console.log(`User ${user.id}: 이미 해시됨, 건너뜀`);
        continue;
      }

      // 3) 평문 비밀번호 → bcrypt 해시로 변환
      const hashed = await bcrypt.hash(user.password, 10);

      // 4) DB에 해시 비밀번호로 업데이트
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });

      console.log(`User ${user.id}: 비밀번호 해시로 업데이트 완료`);
    }

    console.log("비밀번호 일괄 해시 처리 완료!");
  } catch (error) {
    console.error("오류 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 바로 실행
hashAllPasswords();
