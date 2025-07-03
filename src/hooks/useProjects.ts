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
  isPersonal: boolean;
};

type TaskCreateParams = {
  id?: number;
  title?: string;
  desc?: string;
  status?: string;
  projectId?: number;
  projectName?: number;
  userId?: number;
  managerId?: number;
};

type ProjectCreateParams = {
  projectName: string;
  deadline: string;
  managerId: number;
  progress?: number;
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

  //project create
  const { mutate: createProjectMutate } = useMutation<
    void,
    Error,
    ProjectCreateParams
  >({
    mutationFn: async (data) => {
      await axios.post(PROJECT_API_PATH, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
    },
    onError: () => {},
  });

  //task create
  const { mutate: createTaskMutate } = useMutation<
    void,
    Error,
    TaskCreateParams
  >({
    mutationFn: async (data) => {
      await axios.post(TASK_PROJECT_API_PATH, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
    },
    onError: () => {},
  });

  //task update
  const { mutate: updateTaskMutate } = useMutation<
    void,
    Error,
    TaskCreateParams
  >({
    mutationFn: async (data) => {
      const { id, title, desc } = data;
      await axios.put(`${TASK_PROJECT_API_PATH}/${id}`, {
        title,
        desc,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
    },
    onError: () => {},
  });

  //project delete
  const { mutate: deleteProjectMutate } = useMutation<
    void,
    Error,
    { id: number }
  >({
    mutationFn: async (data) => {
      const { id } = data;
      await axios.delete(`${PROJECT_API_PATH}/${id}/kanban`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
    },
    onError: () => {},
  });

  //task delete
  const { mutate: deleteTaskMutate } = useMutation<void, Error, { id: number }>(
    {
      mutationFn: async (data) => {
        const { id } = data;
        await axios.delete(`${TASK_PROJECT_API_PATH}/${id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
      },
      onError: () => {},
    }
  );

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
    createProjectMutate,
    createTaskMutate,
    //update
    updateTaskMutate,
    //delete
    deleteProjectMutate,
    deleteTaskMutate,
  };
};

export default useProjects;
