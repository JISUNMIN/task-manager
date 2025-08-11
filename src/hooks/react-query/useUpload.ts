import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { showToast, ToastMode } from "@/lib/toast";

const TASK_UPLOAD_API_PATH = "/tasks";

const useUpload = (targetId?: string | number) => {
  const queryClient = useQueryClient();

  // upload
  const {
    mutate: upload,
    isSuccess,
    isError,
    status,
  } = useMutation<{ profileImage: string }, Error, FormData>({
    mutationFn: async (formData) => {
      const res = await axios.post(
        `${TASK_UPLOAD_API_PATH}/${targetId}/upload`,
        formData
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
      showToast({ type: ToastMode.SUCCESS, action: "CHANGE" });
    },
    onError: () => {
      showToast({ type: ToastMode.ERROR, action: "CHANGE" });
    },
  });

  return {
    //update
    upload,
    isSuccess,
    isError,
    status,
  };
};

export default useUpload;
