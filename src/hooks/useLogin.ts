import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { showToast, ToastMode } from "@/lib/toast";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/useAuthStore";

type LoginParams = {
  userId: string;
  password: string;
};

type LoginResponse = {
  userId: string;
  token: string;
};

const API_PATH = "/api/auth/login";

const useLogin = () => {
  const router = useRouter();
  const { login } = useAuthStore();

  const { mutate: loginMutation, isPending } = useMutation<
    LoginResponse,
    AxiosError<{ error: string }>,
    LoginParams
  >({
    mutationFn: async (data) => {
      const res = await axios.post(API_PATH, data);
      return res.data;
    },
    onSuccess: (result) => {
      // 로그인 성공 후 처리
      // 예: 토큰 저장, 유저 정보 저장 등
      // localStorage.setItem("token", result.token); 등

      login({ userId: result.userId });
      router.replace("/dashboard/kanban");
    },
    onError: (error) => {
      const message =
        error.response?.data?.error || "서버와 통신 중 오류가 발생했습니다.";
      showToast({ type: ToastMode.ERROR, action: "SAVE", content: message });
      console.error(error);
    },
  });

  return {
    loginMutation,
    isPending,
  };
};

export default useLogin;
