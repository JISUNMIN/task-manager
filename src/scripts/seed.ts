import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { ProjectLabel, Role } from "@prisma/client";

const DEMO_PASSWORD = "testDemo123!";

async function upsertUser(userId: string, name: string, role: Role) {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  return prisma.user.upsert({
    where: { userId },
    update: {
      name,
      role,
      password: hashedPassword,
    },
    create: {
      userId,
      name,
      role,
      password: hashedPassword,
    },
  });
}

async function upsertProject(params: {
  managerId: number;
  projectName: string;
  deadline: Date | null;
  label?: ProjectLabel;
  isPersonal?: boolean;
}) {
  const { managerId, projectName, deadline, label, isPersonal = false } = params;
  const existingProject = await prisma.project.findFirst({
    where: {
      managerId,
      projectName,
      isPersonal,
    },
  });

  if (existingProject) {
    return prisma.project.update({
      where: { id: existingProject.id },
      data: {
        deadline,
        label,
      },
    });
  }

  return prisma.project.create({
    data: {
      projectName,
      progress: 0,
      deadline,
      label,
      managerId,
      isPersonal,
    },
  });
}

async function upsertTask(params: {
  projectId: number;
  managerId: number;
  title: string;
  desc: string;
  status: string;
  order: number;
  assigneeIds?: number[];
}) {
  const { projectId, managerId, title, desc, status, order, assigneeIds = [] } = params;
  const existingTask = await prisma.task.findFirst({
    where: {
      projectId,
      title,
    },
  });

  if (existingTask) {
    return prisma.task.update({
      where: { id: existingTask.id },
      data: {
        desc,
        status,
        order,
        managerId,
        assignees: {
          set: assigneeIds.map((id) => ({ id })),
        },
      },
    });
  }

  return prisma.task.create({
    data: {
      title,
      desc,
      status,
      order,
      projectId,
      managerId,
      assignees: {
        connect: assigneeIds.map((id) => ({ id })),
      },
    },
  });
}

async function upsertComment(taskId: number, userId: number, comment: string) {
  const existingComment = await prisma.comment.findFirst({
    where: {
      taskId,
      userId,
      comment,
    },
  });

  if (existingComment) {
    return existingComment;
  }

  return prisma.comment.create({
    data: {
      taskId,
      userId,
      comment,
    },
  });
}

async function ensurePersonalProject(userId: number, userName: string) {
  const existingProject = await prisma.project.findFirst({
    where: {
      managerId: userId,
      isPersonal: true,
    },
  });

  if (existingProject) {
    return existingProject;
  }

  return prisma.project.create({
    data: {
      projectName: `${userName}의 개인 프로젝트`,
      progress: 0,
      managerId: userId,
      isPersonal: true,
    },
  });
}

async function main() {
  const demoAdmin = await upsertUser("testDemo", "Demo Admin", "ADMIN");
  const demoMember = await upsertUser("demoUser", "Demo Member", "USER");

  await ensurePersonalProject(demoAdmin.id, demoAdmin.name);
  await ensurePersonalProject(demoMember.id, demoMember.name);

  const allowedTeamProjectNames = [
    "팀 협업 보드 예시",
    "출시 준비 체크리스트",
  ];

  await prisma.project.deleteMany({
    where: {
      isPersonal: false,
      projectName: {
        notIn: allowedTeamProjectNames,
      },
    },
  });

  const sprintProject = await upsertProject({
    managerId: demoAdmin.id,
    projectName: "팀 협업 보드 예시",
    deadline: new Date("2026-07-31"),
    label: "feature",
  });

  const launchProject = await upsertProject({
    managerId: demoAdmin.id,
    projectName: "출시 준비 체크리스트",
    deadline: new Date("2026-08-15"),
    label: "design",
  });

  const backlogTask = await upsertTask({
    projectId: sprintProject.id,
    managerId: demoAdmin.id,
    title: "로그인 UX 최종 점검",
    desc: "데모 계정 자동 입력, 에러 메시지 정리, 첫 화면 진입 흐름을 점검합니다.",
    status: "To Do",
    order: 1,
    assigneeIds: [demoAdmin.id],
  });

  const progressTask = await upsertTask({
    projectId: sprintProject.id,
    managerId: demoAdmin.id,
    title: "칸반 패널 인터랙션 다듬기",
    desc: "우측 상세 패널 열림/닫힘, 리사이즈, 상태 변경 동작을 마감 품질로 정리합니다.",
    status: "In Progress",
    order: 2,
    assigneeIds: [demoAdmin.id, demoMember.id],
  });

  const doneTask = await upsertTask({
    projectId: launchProject.id,
    managerId: demoAdmin.id,
    title: "README 포트폴리오 보강",
    desc: "핵심 기능, 실행 방법, 데모 계정, 검증 상태를 문서화합니다.",
    status: "Completed",
    order: 1,
    assigneeIds: [demoMember.id],
  });

  await upsertComment(
    backlogTask.id,
    demoAdmin.id,
    "로그인 화면에 데모 계정을 기본 입력해 두면 평가자가 바로 확인할 수 있어요."
  );
  await upsertComment(
    progressTask.id,
    demoMember.id,
    "패널 반응성이 좋아져서 실제 협업 툴처럼 느껴집니다. 모바일에서도 한 번 더 확인해볼게요."
  );
  await upsertComment(
    doneTask.id,
    demoAdmin.id,
    "README에 데모 계정과 실행 방법을 추가해서 진입 장벽을 낮췄습니다."
  );

  console.log("Demo seed completed.");
  console.log(`Demo login ID: ${demoAdmin.userId}`);
  console.log(`Demo login PW: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
