import { showToast, ToastMode } from "@/lib/toast";
import { User, Task, Project } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

export type ClientProject = Omit<Project, "deadline" | "managerId"> & {
  deadline: string;
  manager: User;
  managerId?: number;
  tasks?: Task[];
};

type ProjectCreateParams = {
  projectName: string;
  deadline: string;
  managerId: number;
  progress?: number;
};

const PROJECT_API_PATH = "/projects";

const useProjects = (targetId?: string | number) => {
  const queryClient = useQueryClient();

  const {
    data: listData,
    isPending: isListPending,
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
    isPending: isDetailPending,
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
    isListPending,
    isListFetching,
    // detail
    detailData,
    isDetailPending,
    isDetailFetching,
  };
};

export default useProjects;
