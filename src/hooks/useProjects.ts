import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type Project = {
  id: number;
  projectId: string;
  progress: number;
  deadline: Date;
  managerId: number;
};

const API_PATH = "/api/projects";

const useProjects = (targetId?: string | number) => {
  const {
    data: listData,
    isPending: isListPending,
    isFetching: isListFetching,
  } = useQuery<Project[], Error>({
    queryKey: ["projects", "list"],
    queryFn: async () => {
      const res = await axios.get<Project[]>(API_PATH);
      return res.data;
    },
    enabled: !targetId,
  });

  const {
    data: detailData,
    isPending: isDetailPending,
    isFetching: isDetailFetching,
  } = useQuery<Project[], Error>({
    queryKey: ["projects", "list", "detail", targetId],
    queryFn: async () => {
      const res = await axios.get<Project[]>(`${API_PATH}/${targetId}/kanban`);
      return res.data;
    },
    enabled: !!targetId,
  });

  return {
    //list
    listData,
    isListPending,
    isListFetching,
    //detail
    detailData,
    isDetailPending,
    isDetailFetching,
  };
};

export default useProjects;
