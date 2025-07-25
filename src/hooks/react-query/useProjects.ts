import { User, Task, Project } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export type ClientProject = Omit<Project, "deadline" | "managerId"> & {
  deadline: string;
  manager: User;
  managerId?: number;
  tasks?: Task[];
};

const PROJECT_API_PATH = "/projects";

const useProjects = (targetId?: string | number) => {
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useQuery<ClientProject[], Error>({
    queryKey: ["projects", "list"],
    queryFn: async () => {
      const res = await axios.get<ClientProject[]>(PROJECT_API_PATH);
      return res.data;
    },
    enabled: !targetId,
  });

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
  } = useQuery<ClientProject, Error>({
    queryKey: ["projects", "list", "detail", targetId],
    queryFn: async () => {
      const res = await axios.get<ClientProject>(
        `${PROJECT_API_PATH}/${targetId}`
      );
      return res.data;
    },
    enabled: !!targetId,
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
