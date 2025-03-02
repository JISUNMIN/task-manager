"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 유효성 검사 스키마 (yup)
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("올바른 이메일을 입력해주세요.")
    .required("이메일을 입력해주세요."),
  password: yup
    .string()
    .min(6, "비밀번호는 최소 6자리 이상이어야 합니다.")
    .required("비밀번호를 입력해주세요."),
});

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();

  // react-hook-form을 사용한 폼 상태 관리
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema), // yup 유효성 검사 연결
  });

  const onSubmit = (data: LoginFormInputs) => {
    login(); // Zustand 상태 변경 (로그인 처리)
    router.push("/dashboard/kanban"); // 로그인 후 이동
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-96 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            로그인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                {...register("email")}
                type="email"
                placeholder="이메일"
                className="w-full"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Input
                {...register("password")}
                type="password"
                placeholder="비밀번호"
                className="w-full"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
