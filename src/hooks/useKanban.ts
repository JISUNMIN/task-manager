// hooks/useKanban.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useKanbanStore } from "@/store/useKanbanStore";
import axios from "axios";
import { Status, Task } from "@/store/useKanbanStore";
import { showToast, ToastMode } from "@/lib/toast";

const API_PATH = (projectId: number) => `/api/projects/${projectId}/kanban`;

export function useKanban(projectId: number) {
  const queryClient = useQueryClient();

  const { setState } = useKanbanStore;

  // ✅ Task 목록 불러오기
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["kanbanTasks", projectId],
    queryFn: async () => {
      const res = await axios.get(API_PATH(projectId));
      return res.data.tasks as Task[];
    },
    onSuccess: (tasks) => {
      const grouped = tasks.reduce(
        (acc, task) => {
          acc[task.status] = acc[task.status] || [];
          acc[task.status].push({ title: task.title, desc: task.desc });
          return acc;
        },
        {} as Record<Status, { title: string; desc: string }[]>
      );

      setState({ columns: grouped });
    },
  });

  // ✅ Task 생성
  const { mutate: createTask } = useMutation({
    mutationFn: async (status: Status) => {
      const currentColumns = useKanbanStore.getState().columns;
      return axios.post(API_PATH(projectId), {
        title: "",
        desc: "",
        status,
        order: currentColumns[status].length,
        userId: 1, // 인증 연동 필요 시 교체
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanbanTasks", projectId] });
      showToast({
        type: ToastMode.SUCCESS,
        action: "SAVE",
        content: "할 일이 추가되었습니다.",
      });
    },
    onError: () => {
      showToast({
        type: ToastMode.ERROR,
        action: "SAVE",
        content: "할 일을 추가할 수 없습니다.",
      });
    },
  });

  // ✅ Task 수정
  const { mutate: editTask } = useMutation({
    mutationFn: async ({
      taskId,
      updatedFields,
    }: {
      taskId: number;
      updatedFields: Partial<{ title: string; desc: string }>;
    }) => {
      return axios.put(`/api/tasks/${taskId}`, updatedFields);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanbanTasks", projectId] });
      showToast({
        type: ToastMode.SUCCESS,
        action: "SAVE",
        content: "작업이 수정되었습니다.",
      });
    },
  });

  // ✅ Task 삭제
  const { mutate: deleteTask } = useMutation({
    mutationFn: async (taskId: number) => {
      return axios.delete(`/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanbanTasks", projectId] });
      showToast({
        type: ToastMode.SUCCESS,
        action: "DELETE",
        content: "작업이 삭제되었습니다.",
      });
    },
  });

  // ✅ Task 이동
  const { mutate: moveTask } = useMutation({
    mutationFn: async (params: {
      fromStatus: Status;
      toStatus: Status;
      fromIndex: number;
      toIndex: number;
    }) => {
      return axios.patch(`/api/tasks/move`, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanbanTasks", projectId] });
    },
  });

  return {
    isLoading,
    createTask,
    editTask,
    deleteTask,
    moveTask,
  };
}
