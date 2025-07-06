import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

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

const TASK_PROJECT_API_PATH = "/api/tasks";

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
    deleteTaskMutate,
  };
};

export default useTasks;
