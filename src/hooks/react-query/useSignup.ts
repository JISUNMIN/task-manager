import { showToast, ToastMode } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";

export type CreateParams = {
  name: string;
  userId: string;
  password: string;
  confirmPassword: string;
};

const API_PATH = "/auth/signup";

const useSignup = () => {
  const router = useRouter();
  const { mutate: createMutate } = useMutation<void, AxiosError, CreateParams>({
    mutationFn: async (data) => {
      await axios.post(API_PATH, data);
    },
    onSuccess: () => {
      showToast({
        type: ToastMode.SUCCESS,
        action: "REGISTER",
      });
      router.replace("/auth/login");
    },
    onError: (error) => {
      const status = error?.response?.status;

      switch (status) {
        case 400:
          showToast({
            type: ToastMode.ERROR,
            action: "REGISTER",
            content: "필수값이 누락되었습니다.",
          });
          break;
        case 409:
          showToast({
            type: ToastMode.ERROR,
            action: "ISEXIST",
          });
          break;
        case 500:
        default:
          showToast({
            type: ToastMode.ERROR,
            action: "REGISTER",
            content: "서버 오류가 발생했습니다.",
          });
          break;
      }
    },
  });

  return {
    //create
    createMutate,
  };
};

export default useSignup;
