import { Status, useKanbanStore } from "@/store/useKanbanStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Task } from "@prisma/client";

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
  projectId: number;
  toColumn: Status;
  newOrder: number;
};

export type BatchMoveItem = {
  taskId: number;
  toColumn: Status;
  toIndex: number;
};

const TASK_PROJECT_API_PATH = "/tasks";

const useTasks = () => {
  const queryClient = useQueryClient();
  const { updateTask } = useKanbanStore();
  const { progress } = useKanbanStore();

  // task create
  const { mutateAsync: createTaskMutate } = useMutation<
    Task,
    Error,
    TaskCreateParams
  >({
    mutationFn: async (data) => {
      const res = await axios.post(TASK_PROJECT_API_PATH, {
        progress,
        ...data,
      });
      return res.data;
    },
    onSuccess: () => {},
    onError: () => {},
  });

  // task update
  const { mutate: updateTaskMutate } = useMutation<
    Task,
    Error,
    TaskCreateParams
  >({
    mutationFn: async (data) => {
      const { id, title, desc, assignees } = data;

      const response = await axios.patch<Task>(
        `${TASK_PROJECT_API_PATH}/${id}`,
        {
          title,
          desc,
          assignees,
        }
      );
      return response.data;
    },
    onSuccess: (updatedTask) => {
      const columnTasks =
        useKanbanStore.getState().columns[updatedTask.status as Status];
      const index = columnTasks.findIndex((t) => t.id === updatedTask.id);
      if (index >= 0) {
        updateTask(updatedTask.status as Status, index, updatedTask);
      }
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
        await axios.delete(`${TASK_PROJECT_API_PATH}/${id}`, {
           data: { progress }
        });
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
