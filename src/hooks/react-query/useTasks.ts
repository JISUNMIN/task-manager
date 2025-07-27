import { Status } from "@/store/useKanbanStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

type TaskCreateParams = {
  id?: number;
  title?: string;
  desc?: string;
  status?: string;
  projectId?: number;
  projectName?: number;
  userId?: number;
  managerId?: number;
  assignees?: number[];
  orderType?: "top" | "bottom";
};

type MoveTaskParams = {
  id: number;
  fromColumn: Status;
  toColumn: Status;
  toIndex: number;
};

const TASK_PROJECT_API_PATH = "/tasks";

const useTasks = () => {
  const queryClient = useQueryClient();

  // task create
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

  // task update
  const { mutate: updateTaskMutate } = useMutation<
    void,
    Error,
    TaskCreateParams
  >({
    mutationFn: async (data) => {
      const { id, title, desc, assignees } = data;
      await axios.patch(`${TASK_PROJECT_API_PATH}/${id}`, {
        title,
        desc,
        assignees,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
    },
    onError: () => {},
  });

  const { mutate: moveTaskMutate } = useMutation<void, Error, MoveTaskParams>({
    mutationFn: async ({ id, fromColumn, toColumn, toIndex }) => {
      await axios.patch(`${TASK_PROJECT_API_PATH}/${id}/moveTask`, {
        fromColumn,
        toColumn,
        toIndex,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
    },
    onError: (error) => {
      console.error("이동 실패:", error);
    },
  });

  // task delete
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
    createTaskMutate,
    updateTaskMutate,
    moveTaskMutate,
    deleteTaskMutate,
  };
};

export default useTasks;
