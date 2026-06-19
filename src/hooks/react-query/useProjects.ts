import { User, Task, Project } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export type ProjectTask = Task & {
  assignees: Pick<User, "id" | "name" | "userId" | "profileImage">[];
};

export type ClientProject = Omit<Project, "deadline" | "managerId"> & {
  deadline: string;
  manager: User;
  managerId?: number;
  tasks?: ProjectTask[];
};

const PROJECT_API_PATH = "/projects";
const PROJECT_STALE_TIME = 1000 * 60 * 5;

export const PROJECT_QUERY_KEYS = {
  list: ["projects", "list"] as const,
  detail: (targetId: string | number) =>
    ["projects", "list", "detail", targetId] as const,
};

export const fetchProjects = async () => {
  const res = await axios.get<ClientProject[]>(PROJECT_API_PATH);
  return res.data;
};

export const fetchProjectDetail = async (targetId: string | number) => {
  const res = await axios.get<ClientProject>(`${PROJECT_API_PATH}/${targetId}`);
  return res.data;
};

const useProjects = (targetId?: string | number) => {
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useQuery<ClientProject[], Error>({
    queryKey: PROJECT_QUERY_KEYS.list,
    queryFn: fetchProjects,
    enabled: !targetId,
    staleTime: PROJECT_STALE_TIME,
    gcTime: PROJECT_STALE_TIME * 2,
    refetchOnWindowFocus: false,
  });

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
  } = useQuery<ClientProject, Error>({
    queryKey: PROJECT_QUERY_KEYS.detail(targetId as string | number),
    queryFn: () => fetchProjectDetail(targetId as string | number),
    enabled: !!targetId,
    staleTime: PROJECT_STALE_TIME,
    gcTime: PROJECT_STALE_TIME * 2,
    refetchOnWindowFocus: false,
  });

  return {
    // list
    listData,
    isListLoading,
    isListFetching,
    // detail
    detailData,
    isDetailLoading,
    isDetailFetching,
  };
};

export default useProjects;
