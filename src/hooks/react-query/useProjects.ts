import { showToast, ToastMode } from "@/lib/toast";
import { ProjectLabel, User, Task, Project } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

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

const PROJECT_API_PATH = "/api/projects";

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

  // project create
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

  // project order update
  const { mutate: updateProjectOrder } = useMutation<
    void,
    Error,
    { projectIds: number[] }
  >({
    mutationFn: async (data) => {
      const { projectIds } = data;
      await axios.patch(`${PROJECT_API_PATH}/reorder`, {
        projectIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
      showToast({ type: ToastMode.SUCCESS, action: "CHANGE" });
    },
    onError: () => {
      showToast({ type: ToastMode.ERROR, action: "CHANGE" });
    },
  });

  // project label update
  const { mutate: updateProjectLabel } = useMutation<
    void,
    Error,
    { label: string }
  >({
    mutationFn: async (data) => {
      const { label } = data;
      await axios.patch(`${PROJECT_API_PATH}/${targetId}/label`, {
        label,
      });
    },
    onSuccess: () => {},
    onError: () => {},
  });

  // project manager update
  const { mutate: updateProjectManager } = useMutation<
    void,
    Error,
    { managerId: number }
  >({
    mutationFn: async (data) => {
      const { managerId } = data;
      await axios.patch(`${PROJECT_API_PATH}/${targetId}/manager`, {
        managerId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
      showToast({ type: ToastMode.SUCCESS, action: "CHANGE" });
    },
    onError: () => {
      showToast({ type: ToastMode.ERROR, action: "CHANGE" });
    },
  });

  // project manager deadline
  const { mutate: updateProjecDeadline } = useMutation<
    void,
    Error,
    { deadline: Date }
  >({
    mutationFn: async (data) => {
      const { deadline } = data;
      await axios.patch(`${PROJECT_API_PATH}/${targetId}/deadline`, {
        deadline,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
      showToast({ type: ToastMode.SUCCESS, action: "CHANGE" });
    },
    onError: () => {
      showToast({ type: ToastMode.ERROR, action: "CHANGE" });
    },
  });

  // project delete
  const { mutate: deleteProjectMutate } = useMutation<void, Error>({
    mutationFn: async () => {
      await axios.delete(`${PROJECT_API_PATH}/${targetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
    },
    onError: () => {},
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
    // create
    createProjectMutate,
    // update
    updateProjectOrder,
    updateProjectLabel,
    updateProjectManager,
    updateProjecDeadline,
    // delete
    deleteProjectMutate,
  };
};

export default useProjects;
