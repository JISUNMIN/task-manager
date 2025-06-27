"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaProjectDiagram,
  FaTasks,
  FaUserCheck,
  FaChartBar,
} from "react-icons/fa";
import Image from "next/image";
import { logo } from "@/assets/images";

interface SignupInputs {
  username: string;
  email: string;
  password: string;
}

const schema = yup.object().shape({
  username: yup.string().required("이름을 입력해주세요."),
  email: yup
    .string()
    .email("유효하지 않은 이메일입니다.")
    .required("이메일을 입력해주세요."),
  password: yup
    .string()
    .min(6, "6자리 이상 입력해주세요.")
    .required("비밀번호를 입력해주세요."),
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
  });

  const onSubmit = (data: SignupInputs) => {
    alert("가입 완료! 🎉");
    console.log("회원가입 데이터:", data);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* 왼쪽 섹션: 로고 및 소개 + FeatureBoxes */}
      <div className="md:w-1/2 bg-brown-50 flex flex-col items-center justify-start p-8 space-y-8">
        {/* 로고 및 말풍선 박스 */}
        <h2 className="text-3xl font-extrabold text-brown-700 mb-6 tracking-wide">
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
                <div className="relative">
                  <Input
                    {...register("username")}
                    placeholder="이름"
                    className="pl-10"
                  />
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
                  {errors.username && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <Input
                    {...register("email")}
                    placeholder="이메일"
                    className="pl-10"
                  />
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="비밀번호"
                    className="pl-10"
                  />
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password.message}
                    </p>
                  )}
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
