import { showToast, ToastMode } from "@/lib/toast";
import { Task, User } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type Project = {
  id: number;
  projectName: string;
  progress: number;
  deadline: string;
  manager: User;
  tasks: Task[];
};

type CreateParams = {
  id?: number;
  title: string;
  desc: string;
  status: string;
  projectName: number;
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
  } = useQuery<Project, Error>({
    queryKey: ["projects", "list", "detail", targetId],
    queryFn: async () => {
      const res = await axios.get<Project>(
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

  //update
  const { mutate: updateMutate } = useMutation<void, Error, CreateParams>({
    mutationFn: async (data) => {
      console.log("data^^^선밍쓰", data);
      const { id, title } = data;
      await axios.put(`${TASK_PROJECT_API_PATH}/${id}`, {
        title,
        // desc,
        // status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
    },
    onError: () => {},
  });

  //delete
  const { mutate: deleteMutate } = useMutation<void, Error, { id: number }>({
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
    //update
    updateMutate,
    //delete
    deleteMutate,
  };
};

export default useProjects;
