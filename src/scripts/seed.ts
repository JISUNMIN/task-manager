// seed.ts
import { prisma } from "../lib/prisma.js";

async function main() {
  // User 생성
  const user1 = await prisma.user.create({
    data: {
      userId: "user01",
      password: "password123",
      name: "홍길동",
    },
  });

  // Project 생성 (managerId는 user1.id로 연결)
  const project1 = await prisma.project.create({
    data: {
      projectId: "project01",
      progress: 0,
      deadline: new Date("2025-12-31"),
      managerId: user1.id,
    },
  });

  // Task 생성 (userId와 managerId는 user1.id, projectId 연결)
  const task1 = await prisma.task.create({
    data: {
      title: "첫 번째 작업",
      desc: "테스트용 작업 설명",
      status: "To Do",
      projectId: project1.id,
      userId: user1.id,
      managerId: user1.id,
    },
  });

  // Comment 생성 (userId, taskId 연결)
  await prisma.comment.create({
    data: {
      comment: "첫 번째 댓글입니다.",
      userId: user1.id,
      taskId: task1.id,
    },
  });

  console.log("초기 데이터가 성공적으로 추가되었습니다.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
