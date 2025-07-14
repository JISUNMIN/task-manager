import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { showToast, ToastMode } from "@/lib/toast";
import  { AxiosError } from "axios";
import { Role, useAuthStore } from "@/store/useAuthStore";
import axios from "@/lib/axios";

type LoginParams = {
  userId: string;
  password: string;
};

type LoginResponse = {
  id: number;
  userId: string;
  name: string;
  token: string;
  role: Role;
  profileImage?: string;
};

const API_PATH = "/auth/login";

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

      const { id, userId, role, name, profileImage } = result;
      console.log("result", result);

      login({ id, userId, role, name, profileImage });
      router.replace("/projectlist");
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
