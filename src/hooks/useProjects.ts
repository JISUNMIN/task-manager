import { showToast, ToastMode } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type Project = {
  id: number;
  projectId: string;
  progress: number;
  deadline: Date;
  managerId: number;
};

type CreateParams = {
  title: string;
  desc: string;
  status: string;
  projectId: number;
  userId: number;
  managerId: number;
};

const PROJECT_API_PATH = "/api/projects";

const TASK_PROJECT_API_PATH = "/api/tasks";

const useProjects = (targetId?: string | number) => {
  const queryClient = useQueryClient();

  const {
    data: listData,
    isPending: isListPending,
    isFetching: isListFetching,
  } = useQuery<Project[], Error>({
    queryKey: ["projects", "list"],
    queryFn: async () => {
      const res = await axios.get<Project[]>(PROJECT_API_PATH);
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
      const res = await axios.get<Project[]>(
        `${PROJECT_API_PATH}/${targetId}/kanban`
      );
      return res.data;
    },
    enabled: !!targetId,
  });

  //create
  const { mutate: createMutate } = useMutation<void, Error, CreateParams>({
    mutationFn: async (data) => {
      await axios.post(TASK_PROJECT_API_PATH, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
    },
    onError: () => {},
  });

  //delete
  const { mutate: deleteMutate } = useMutation<void, Error, { id: string }>({
    mutationFn: async (data) => {
      const { id } = data;
      await axios.delete(`${TASK_PROJECT_API_PATH}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
    },
    onError: () => {},
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
    //create
    createMutate,
    //delete
    deleteMutate,
  };
};

export default useProjects;
