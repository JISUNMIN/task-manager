"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { logo } from "@/assets/images";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import useProjects from "@/hooks/react-query/useProjects";
import { convertDateToString } from "@/lib/utils/helpers";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function KanbanSidebar() {
  const router = useRouter();
  const { listData } = useProjects();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("projectId");

  //  개인 프로젝트는 본인 것만 필터링
  const filteredProjects = listData?.filter((project) => {
    if (project.isPersonal) {
      return project?.manager.id === user?.id;
    }
    return true;
  });

  const handleSetProjectId = (newProjectId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("projectId", String(newProjectId));

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Sidebar className="pt-14">
      <SidebarContent className="bg-green-50">
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
              <p className="text-base sm:text-lg lg:text-2xl font-extrabold text-center text-gray-800 drop-shadow-md mb-2">
                Squirrel Board
              </p>
            </div>
            <SidebarMenu>
              <div>
                {filteredProjects?.map((project) => {
                  const isSelected = selectedProjectId === String(project.id);
                  return (
                    <SidebarMenuItem
                      key={project.id}
                      onClick={() => handleSetProjectId(project.id)}
                    >
                      <SidebarMenuButton
                        className={cn(
                          "flex flex-col items-start mb-2 border-b border-gray-300 bg-gray-50 p-3 rounded-md shadow-sm h-full",
                          isSelected
                            ? "bg-gray-200 opacity-95 border-gray-400 shadow-md"
                            : "hover:bg-gray-100 hover:border-gray-400"
                        )}
                      >
                        <div className="flex flex-col gap-y-1">
                          <p className="font-semibold text-gray-700 text-xs sm:text-sm lg:text-base">
                            📌 프로젝트명: {project.projectName}
                          </p>
                          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                            👤 담당자: {project.manager.name}
                          </p>
                          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                            📊 진행률: {project.progress}%
                          </p>
                          {!project.isPersonal && (
                            <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                              🗓 마감일:
                              {convertDateToString(
                                new Date(project.deadline),
                                "-"
                              )}
                            </p>
                          )}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
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
