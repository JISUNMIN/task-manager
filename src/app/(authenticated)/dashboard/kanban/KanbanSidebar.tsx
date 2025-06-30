"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { logo } from "@/assets/images";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import useProjects from "@/hooks/useProjects";
import { convertDateToString, formatDate } from "@/lib/utils/helpers";

export function KanbanSidebar() {
  const router = useRouter();
  const { listData } = useProjects();
  const { logout } = useAuthStore();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const handleNavigate = () => {
    router.push("/projectlist");
  };

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <Sidebar>
      <SidebarContent className="bg-green-50">
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupContent>
            <div>
              {/* 로고 */}
              <div className="flex justify-center">
                <Image src={logo} alt="Logo" width={150} height={300} />
              </div>
              <p className="text-2xl font-extrabold text-center text-gray-800 drop-shadow-md mb-2">
                Squirrel Board
              </p>
            </div>
            <SidebarMenu>
              <div>
                <ul>
                  {Array.isArray(listData) &&
                    listData.map((project) => (
                      <SidebarMenuItem
                        key={project.id}
                        onClick={() =>
                          console.log(`클릭한 프로젝트: ${project.id}`)
                        }
                      >
                        <SidebarMenuButton className="flex flex-col items-start mb-2 border-b border-gray-300 bg-gray-50 p-3 rounded-md shadow-sm h-full">
                          <a href={"#"}>
                            <p className="font-semibold text-gray-700">
                              📌 프로젝트명: {project.projectName}
                            </p>
                            <p className="text-gray-600">
                              👤 담당자: {project.manager.name}
                            </p>
                            <p className="text-gray-600">
                              📊 진행률: {project.progress}%
                            </p>
                            <p className="text-gray-600">
                              🗓 마감일:
                              {convertDateToString(
                                new Date(project.deadline),
                                "-"
                              )}
                            </p>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </ul>
              </div>
              <SidebarFooter>
                <div className="mt-auto flex flex-col gap-1">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleNavigate}
                  >
                    프로젝트 현황
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </Button>
                </div>
              </SidebarFooter>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
