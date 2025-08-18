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
import { CardSkeleton } from "@/components/ui/extended/Skeleton/CardSkeleton";
import { useKanbanStore } from "@/store/useKanbanStore";

export function KanbanSidebar() {
  const router = useRouter();
  const { progress } = useKanbanStore();

  const { listData, isListLoading } = useProjects();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("projectId");
  const prevProjectIdRef = useRef<string | null>(null);

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
        element.focus({ preventScroll: true });
        element.scrollIntoView({
          behavior: "auto",
          block: "nearest",
        });
      }
    }
  }, []);
  useEffect(() => {
    prevProjectIdRef.current = selectedProjectId;
  }, [filteredProjects, selectedProjectId]);

  return (
    <Sidebar className="pt-14">
      <SidebarContent className={`bg-[var(--bg-third)]`}>
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="sticky top-0 z-10 bg-[var(--bg-third)] pb-3">
              {/* 로고 */}
              <div className="flex justify-center">
                <Link href="/projectlist">
                  <Image
                    src={logo}
                    alt="Logo"
                    priority
                    className="cursor-pointer w-[100px] md:w-[120px] lg:w-[150px]"
                  />
                </Link>
              </div>
              <p className="text-base sm:text-lg lg:text-2xl font-extrabold text-center drop-shadow-md mb-2">
                Squirrel Board
              </p>
            </div>
            <SidebarMenu>
              <div>
                {isListLoading ? (
                  <div className="flex flex-col">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="mb-2">
                        <CardSkeleton width="w-full h-28" />
                      </div>
                    ))}
                  </div>
                ) : (
                  filteredProjects?.map((project, index) => {
                    const isSelected = selectedProjectId === String(project.id);
                    const isProjectChanged =
                      prevProjectIdRef.current !== selectedProjectId;
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
                            : "var(--item-bg)",
                        }}
                      >
                        <p className="font-medium">
                          📌 프로젝트명: {project.projectName}
                        </p>
                        <p className="text-sm">
                          👤 담당자: {project.manager.name}{" "}
                          <span className="text-xs text-gray-500 dark:text-gray-300">
                            ({project?.manager?.userId})
                          </span>
                        </p>
                        <p className="text-sm">
                          📊 진행률:{" "}
                          {isSelected
                            ? isProjectChanged
                              ? project.progress
                              : progress
                            : project.progress}
                          %
                        </p>
                        {!project.isPersonal && (
                          <p className="text-xs sm:text-sm lg:text-base">
                            🗓 마감일:{" "}
                            {convertDateToString(
                              new Date(project.deadline),
                              "-"
                            )}
                          </p>
                        )}
                      </SidebarMenuButton>
                    );
                  })
                )}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
