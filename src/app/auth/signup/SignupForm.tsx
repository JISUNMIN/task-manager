"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaUser,
  FaProjectDiagram,
  FaTasks,
  FaUserCheck,
  FaChartBar,
} from "react-icons/fa";
import Image from "next/image";
import { logo } from "@/assets/images";
import useSignup from "@/hooks/react-query/useSignup";
import { PasswordInput } from "@/components/form/PasswordInput";

interface SignupInputs {
  name: string;
  userId: string;
  password: string;
  confirmPassword: string;
}

const schema = yup.object().shape({
  name: yup
    .string()
    .min(2, "이름은 최소 2자 이상이어야 합니다.")
    .max(20, "이름은 최대 20자 이내여야 합니다.")
    .required("이름을 입력해주세요."),

  userId: yup
    .string()
    .matches(/^[a-z0-9]+$/, "아이디는 영문 소문자와 숫자만 사용할 수 있습니다.")
    .min(4, "아이디는 최소 4자 이상이어야 합니다.")
    .max(12, "아이디는 최대 12자 이내여야 합니다.")
    .required("아이디를 입력해주세요."),

  password: yup
    .string()
    .min(6, "비밀번호는 최소 6자 이상이어야 합니다.")
    .max(20, "비밀번호는 최대 20자 이내여야 합니다.")
    .required("비밀번호를 입력해주세요."),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다.")
    .required("비밀번호 확인을 입력해주세요."),
});

function FeatureBoxes() {
  const features = [
    {
      icon: <FaProjectDiagram className="text-brown-500 w-8 h-8" />,
      title: "프로젝트 생성",
      description: "여러 프로젝트를 손쉽게 생성하고 관리할 수 있습니다.",
    },
    {
      icon: <FaTasks className="text-brown-500 w-8 h-8" />,
      title: "Task 관리",
      description: "프로젝트 내에서 다양한 Task를 만들어 담당자를 지정하세요.",
    },
    {
      icon: <FaUserCheck className="text-brown-500 w-8 h-8" />,
      title: "담당자 지정",
      description: "효율적인 업무 분담으로 팀워크를 강화합니다.",
    },
    {
      icon: <FaChartBar className="text-brown-500 w-8 h-8" />,
      title: "칸반 보드",
      description:
        "직관적인 칸반 보드로 업무 진행 상황을 한눈에 파악할 수 있습니다.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto mt-8">
      {features.map(({ icon, title, description }, idx) => (
        <div
          key={idx}
          className="shadow-xl  bg-white flex flex-col items-center text-center p-6 border rounded-lg hover:shadow-xl transition"
        >
          <div className="mb-4">{icon}</div>
          <h3 className="font-semibold text-lg mb-2 text-brown-700">{title}</h3>
          <p className="text-brown-600 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInputs>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const { createMutate } = useSignup();

  const onSubmit = (data: SignupInputs) => {
    createMutate(data);
    console.log("회원가입 데이터:", data);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* 왼쪽 섹션: 로고 및 소개 + FeatureBoxes */}
      <div className="md:w-1/2 bg-brown-50 flex flex-col items-center justify-start p-8 space-y-8">
        {/* 로고 및 말풍선 박스 */}
        <h2 className="text-3xl font-extrabold  mb-6 tracking-wide text-center">
          Squireal Dashboard
        </h2>
        <div className="flex flex-col items-center relative">
          <Image
            src={logo}
            alt="Logo"
            width={220}
            height={220}
            className="mb-4"
          />

          {/* 말풍선 */}
          <div className="relative bg-white px-6 py-3 rounded-xl max-w-xs text-center text-sm font-medium leading-snug shadow-md">
            Squireal Dashboard에 <br />
            오신 것을 환영합니다!
            <span
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full
      border-8 border-b-brown-200 border-l-transparent border-r-transparent border-t-transparent"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* 기능박스 */}
        <FeatureBoxes />
      </div>

      {/* 오른쪽 섹션: 회원가입 폼 */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-center text-3xl font-bold mb-6 text-brown-800 drop-shadow">
            회원 가입
          </h1>

          <Card className="shadow-xl border-2 border-brown-200">
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="userId" className="text-sm text-gray-600">
                      아이디
                    </label>
                    <div className="flex items-center rounded-md px-3 py-2 text-sm text-gray-700  border transition-colors duration-300 focus-within:border-2 focus-within:border-gray-700">
                      <FaUser className="mr-2 w-4 h-4" />
                      <input
                        {...register("userId")}
                        placeholder="아이디"
                        className="flex-1 border-none p-0 focus:outline-none focus:ring-0"
                      />
                    </div>
                    {errors.userId && (
                      <p className="text-sm text-red-500 -mt-1">
                        {errors.userId.message}
                      </p>
                    )}
                  </div>
                  <PasswordInput
                    register={register}
                    name="password"
                    placeholder="비밀번호"
                    errors={errors}
                  />

                  <PasswordInput
                    register={register}
                    name="confirmPassword"
                    placeholder="비밀번호 확인"
                    errors={errors}
                  />
                  <div className="flex flex-col gap-1">
                    <label htmlFor="name" className="text-sm text-gray-600">
                      이름
                    </label>
                    <div className="flex items-center rounded-md px-3 py-2 text-sm  border transition-colors duration-300 focus-within:border-2 focus-within:border-gray-700">
                      <input
                        {...register("name")}
                        placeholder="이름"
                        className="flex-1 border-none p-0 focus:outline-none focus:ring-0"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-500 -mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  가입하기
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
