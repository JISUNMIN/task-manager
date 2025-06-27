import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export type CreateParams = {
  name: string;
  userId: string;
  password: string;
  confirmPassword: string;
};

const API_PATH = "/api/auth/signup";

const useSignup = () => {
  const { mutate: createMutate } = useMutation<void, Error, CreateParams>({
    mutationFn: async (data) => {
      console.log("1");
      await axios.post(API_PATH, data);
    },
    onSuccess: () => {
      console.log("회원가입 성공");
    },
    onError: (error) => {
      console.error("회원가입 실패:", error.message);
    },
  });

  return {
    //create
    createMutate,
  };
};

export default useSignup;
