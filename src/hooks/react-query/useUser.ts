import { User } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { showToast, ToastMode } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";

const USER_API_PATH = "/users";
const USER_STALE_TIME = 1000 * 60 * 10;

export type UserSummary = Pick<User, "id" | "name" | "role" | "userId" | "profileImage">;
export type ProfileSummary = {
  managedProjectsCount: number;
  assignedTasksCount: number;
  completedTasksCount: number;
  overdueTasksCount: number;
  highPriorityTasksCount: number;
  recentActivityCount: number;
  personalProjectId: number | null;
  recommendedProjectId: number | null;
};

export const USER_QUERY_KEYS = {
  list: ["users", "list"] as const,
  profileSummary: (targetId: string | number) => ["users", "summary", targetId] as const,
};

export const fetchUsers = async () => {
  const res = await axios.get<UserSummary[]>(USER_API_PATH);
  return res.data;
};

const useUser = (targetId?: string | number) => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useQuery<UserSummary[], Error>({
    queryKey: USER_QUERY_KEYS.list,
    queryFn: fetchUsers,
    staleTime: USER_STALE_TIME,
    gcTime: USER_STALE_TIME * 2,
    refetchOnWindowFocus: false,
  });

  const {
    data: profileSummary,
    isLoading: isProfileSummaryLoading,
  } = useQuery<ProfileSummary, Error>({
    queryKey: USER_QUERY_KEYS.profileSummary(targetId as string | number),
    queryFn: async () => {
      const res = await axios.get<ProfileSummary>(`${USER_API_PATH}/${targetId}/summary`);
      return res.data;
    },
    enabled: !!targetId,
    staleTime: USER_STALE_TIME,
    gcTime: USER_STALE_TIME * 2,
    refetchOnWindowFocus: false,
  });

  // profileImage update
  const { mutate: updateProfile } = useMutation<
    { profileImage: string },
    Error,
    FormData
  >({
    mutationFn: async (formData) => {
      const res = await axios.patch(
        `${USER_API_PATH}/${targetId}/profile`,
        formData
      );
      return res.data;
    },
    onSuccess: (updatedUser) => {
      updateUser({
        profileImage: updatedUser.profileImage,
      });
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profileSummary(targetId as string | number) });
      showToast({ type: ToastMode.SUCCESS, action: "CHANGE" });
    },
    onError: () => {
      showToast({ type: ToastMode.ERROR, action: "CHANGE" });
    },
  });

  return {
    //list
    listData,
    isListLoading,
    isListFetching,
    profileSummary,
    isProfileSummaryLoading,
    //update
    updateProfile,
  };
};

export default useUser;
