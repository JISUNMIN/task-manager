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

export function KanbanSidebar() {
  const router = useRouter();
  const { listData } = useProjects();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();

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
                <Image src={logo} alt="Logo" width={150} height={300} />
              </div>
              <p className="text-2xl font-extrabold text-center text-gray-800 drop-shadow-md mb-2">
                Squirrel Board
              </p>
            </div>
            <SidebarMenu>
              <div>
                <ul>
                  {filteredProjects?.map((project) => (
                    <SidebarMenuItem
                      key={project.id}
                      onClick={() => handleSetProjectId(project.id)}
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
                          {!project.isPersonal && (
                            <p className="text-gray-600">
                              🗓 마감일:
                              {convertDateToString(
                                new Date(project.deadline),
                                "-"
                              )}
                            </p>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </ul>
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
