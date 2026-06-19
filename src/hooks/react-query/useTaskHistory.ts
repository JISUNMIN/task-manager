import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export type TaskHistoryItem = {
  id: number;
  taskId: number;
  actorId: number | null;
  type: string;
  fieldLabel: string | null;
  fromValue: string | null;
  toValue: string | null;
  createdAt: string;
  label: string;
  actor: {
    id: number;
    name: string;
    userId: string;
    profileImage?: string | null;
  } | null;
};

const useTaskHistory = (taskId?: number | null) => {
  const {
    data: history,
    isLoading,
    isFetching,
  } = useQuery<TaskHistoryItem[], Error>({
    queryKey: ["tasks", "history", taskId],
    queryFn: async () => {
      const res = await axios.get<TaskHistoryItem[]>(`/tasks/${taskId}/history`);
      return res.data;
    },
    enabled: typeof taskId === "number",
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  return {
    history,
    isLoading,
    isFetching,
  };
};

export default useTaskHistory;
