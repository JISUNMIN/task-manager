"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaUser } from "react-icons/fa";
import Image from "next/image";
import { logo } from "@/assets/images";
import useLogin from "../../../../hooks/react-query/useLogin";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/form/PasswordInput";

const schema = yup.object().shape({
  userId: yup
    .string()
    .min(4, "아이디를 4자 이상 입력해주세요.")
    .max(12, "아이디는 최대 12자 이내여야 합니다.")
    .required("아이디를 입력해주세요."),

  password: yup
    .string()
    .min(6, "비밀번호를 6자 이상 입력해주세요.")
    .max(20, "비밀번호는 최대 20자 이내여야 합니다.")
    .required("비밀번호를 입력해주세요."),
});

interface LoginFormInputs {
  userId: string;
  password: string;
}

export default function LoginForm() {
  const { loginMutation, isPending } = useLogin();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormInputs) => {
    loginMutation(data);
  };

  const onClickSignup = () => {
    router.push("/auth/signup");
  };

  return (
    <div className="flex min-h-screen items-center justify-center transition-colors duration-300">
      <div>
        <div className="flex justify-center mt-8">
          <Image src={logo} alt="Logo" width={160} height={160} priority />
        </div>
        <p className="logo-name text-2xl">Squirrel Board</p>
        <Card className="w-full max-w-[20rem] sm:max-w-[24rem] sm:w-96 cardStyle mt-5">
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="userId" className="text-sm">
                  아이디
                </label>
                <div className="inputDivStyle">
                  <FaUser className="mr-2 w-4 h-4" />
                  <input
                    {...register("userId")}
                    placeholder="아이디"
                    defaultValue="admin"
                    disabled={isPending}
                  />
                </div>
                {errors.userId && (
                  <p className="text-sm text-red-500 -mt-1">{errors.userId.message}</p>
                )}
              </div>
              <PasswordInput
                register={register}
                name="password"
                placeholder="비밀번호"
                defaultValue="123123"
                errors={errors}
                disabled={isPending}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "로그인 중..." : "로그인"}
              </Button>
              <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
                계정이 없으신가요?{" "}
                <span
                  onClick={onClickSignup}
                  className="text-blue-600 font-semibold cursor-pointer hover:underline dark:text-blue-400"
                >
                  회원가입
                </span>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
