"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Image from "next/image";
import { logo } from "@/assets/images";
import useLogin from "./hooks/useLogin";

// 유효성 검사 스키마 (yup)
const loginSchema = yup.object().shape({
  userId: yup.string().required("아이디를 입력해주세요."),
  password: yup
    .string()
    .min(6, "비밀번호는 최소 6자리 이상이어야 합니다.")
    .required("비밀번호를 입력해주세요."),
});

interface LoginFormInputs {
  userId: string;
  password: string;
}

export default function LoginForm() {
  const { loginMutation } = useLogin();

  // react-hook-form을 사용한 폼 상태 관리
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema), // yup 유효성 검사 연결
  });

  const onSubmit = async (data: LoginFormInputs) => {
    loginMutation(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>
        <div className="flex justify-center mt-8">
          <Image src={logo} alt="Logo" width={150} height={300} />
        </div>
        <p className="text-2xl font-extrabold text-center text-gray-800  drop-shadow-md">
          Squirrel Board
        </p>
        <Card className="w-96 shadow-lg">
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <Input
                  {...register("userId")}
                  type="string"
                  placeholder="이메일"
                  className="w-full pl-10"
                />
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              {errors.userId && (
                <p className="text-red-500 text-sm">{errors.userId.message}</p>
              )}
              <div className="relative">
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="비밀번호"
                  className="w-full pl-10"
                />
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
              <Button type="submit" className="w-full cursor-pointer">
                로그인
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
