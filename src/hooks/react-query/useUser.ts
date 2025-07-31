import { User } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { showToast, ToastMode } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";

const USER_API_PATH = "/users";

const useUser = (targetId?: string | number) => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useQuery<User[], Error>({
    queryKey: ["users", "list"],
    queryFn: async () => {
      const res = await axios.get<User[]>(USER_API_PATH);
      return res.data;
    },
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
    //update
    updateProfile,
  };
};

export default useUser;
