"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { logo } from "@/assets/images";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import useProjects from "@/hooks/react-query/useProjects";
import { convertDateToString } from "@/lib/utils/helpers";
import Link from "next/link";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

export function KanbanSidebar() {
  const router = useRouter();

  const { listData } = useProjects();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("projectId");

  // 개인 프로젝트는 본인 것만 필터링
  const filteredProjects = listData?.filter((project) => {
    if (project.isPersonal) {
      return project?.manager.id === user?.id;
    }
    return true;
  });

  // ref 배열
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSetProjectId = (newProjectId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("projectId", String(newProjectId));

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // 페이지 진입 시 선택된 아이템 포커스 및 스크롤
  useEffect(() => {
    if (!filteredProjects || !selectedProjectId) return;

    const selectedIndex = filteredProjects.findIndex(
      (p) => String(p.id) === selectedProjectId
    );

    if (selectedIndex !== -1) {
      const element = buttonRefs.current[selectedIndex];
      if (element) {
        element.focus({ preventScroll: true }); // 포커스 이동
        // 스크롤 이동 (가장 가까운 스크롤 가능 영역에 맞게)
        element.scrollIntoView({
          behavior: "auto",
          block: "nearest",
        });
      }
    }
  }, []);

  return (
    <Sidebar className="pt-14">
      <SidebarContent className={`bg-[var(--bg-third)]`}>
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupContent>
            <div>
              {/* 로고 */}
              <div className="flex justify-center">
                <Link href="/projectlist">
                  <Image
                    src={logo}
                    alt="Logo"
                    priority
                    className="cursor-pointer  w-[100px] md:w-[120px]  lg:w-[150px]"
                  />
                </Link>
              </div>
              <p className="text-base sm:text-lg lg:text-2xl font-extrabold text-center drop-shadow-md mb-2">
                Squirrel Board
              </p>
            </div>
            <SidebarMenu>
              <div>
                {filteredProjects?.map((project, index) => {
                  const isSelected = selectedProjectId === String(project.id);
                  return (
                    <SidebarMenuButton
                      key={project.id}
                      role="button"
                      ref={(el) => {
                        buttonRefs.current[index] = el;
                      }}
                      onClick={() => handleSetProjectId(project.id)}
                      className={cn(
                        "flex flex-col items-start mb-2 border-b p-3 rounded-md shadow-sm h-full",
                        isSelected
                          ? "border-gray-400 shadow-md"
                          : "hover:border-gray-400"
                      )}
                      style={{
                        backgroundColor: isSelected
                          ? "var(--box-bg-selected)" 
                          : "var(--box-bg)", 
                      }}
                    >
                      <p className="font-medium text-gray-800">
                        📌 프로젝트명: {project.projectName}
                      </p>
                      <p className="text-sm text-gray-600">
                        👤 담당자: {project.manager.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        📊 진행률: {project.progress}%
                      </p>
                      {!project.isPersonal && (
                        <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                          🗓 마감일:
                          {convertDateToString(new Date(project.deadline), "-")}
                        </p>
                      )}
                    </SidebarMenuButton>
                  );
                })}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
