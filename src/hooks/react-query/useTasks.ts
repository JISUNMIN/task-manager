import { Status, useKanbanStore } from "@/store/useKanbanStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Task, TaskPriority } from "@prisma/client";

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
  priority?: TaskPriority;
  dueDate?: string | null;
  orderType?: "top" | "bottom";
  newOrder?: number;
};

type MoveTaskParams = {
  id: number;
  projectId: number;
  toColumn: Status;
  newOrder: number;
};

type TaskUpdateResponse = Omit<Task, "assignees"> & {
  assignees?: Array<{ id: number }>;
};

const TASK_PROJECT_API_PATH = "/tasks";

const useTasks = () => {
  const queryClient = useQueryClient();
  const progress = useKanbanStore((state) => state.progress);

  const invalidateProjectQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
  };

  // task create
  const { mutateAsync: createTaskMutate } = useMutation<
    Task,
    Error,
    TaskCreateParams
  >({
    mutationFn: async (data) => {
      const { newOrder } = data;
      const res = await axios.post(TASK_PROJECT_API_PATH, {
        order: newOrder,
        progress,
        ...data,
      });
      return res.data;
    },
    onSuccess: invalidateProjectQueries,
    onError: () => {},
  });

  // task update
  const { mutate: updateTaskMutate } = useMutation<TaskUpdateResponse, Error, TaskCreateParams>({
    mutationFn: async (data) => {
      const { id, title, desc, assignees, priority, dueDate } = data;

      const response = await axios.patch<TaskUpdateResponse>(
        `${TASK_PROJECT_API_PATH}/${id}`,
        {
          title,
          desc,
          assignees,
          priority,
          dueDate,
        }
      );
      return response.data;
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "history", updatedTask.id] });
    },
    onError: () => {},
  });

  const { mutate: moveTaskMutate } = useMutation<void, Error, MoveTaskParams>({
    mutationFn: async ({ id, projectId, toColumn, newOrder }) => {
      await axios.patch(`${TASK_PROJECT_API_PATH}/${id}/moveTask`, {
        projectId,
        toColumn,
        order: newOrder, // 프론트에서 계산한 order
        progress,
      });
    },
    onSuccess: (_, variables) => {
      invalidateProjectQueries();
      queryClient.invalidateQueries({ queryKey: ["tasks", "history", variables.id] });
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
        await axios.delete(`${TASK_PROJECT_API_PATH}/${id}`, {
          data: { progress },
        });
      },
      onSuccess: invalidateProjectQueries,
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
