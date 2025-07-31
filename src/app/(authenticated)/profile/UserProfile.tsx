import { PasswordInput } from "@/components/form/PasswordInput";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useUser from "@/hooks/react-query/useUser";
import { ImageUploader } from "@/components/shared/editor/ImageUploader";

const schema = yup.object().shape({
  password: yup
    .string()
    .notRequired()
    .test(
      "password-length",
      "비밀번호를 6자 이상 입력해주세요.",
      (value) => !value || value.length >= 6
    )
    .test(
      "password-max-length",
      "비밀번호는 최대 20자 이내여야 합니다.",
      (value) => !value || value.length <= 20
    ),
  // confirmPassword: yup.string().when("password", (password, schema) => {
  //   console.log("password", password);
  //   return password && password.length > 0
  //     ? schema
  //         .required("비밀번호 확인을 입력해주세요.")
  //         .oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다.")
  //     : schema.notRequired();
  // }),
});

export default function UserProfile() {
  const { user } = useAuthStore();
  const userId = user?.userId ?? "";
  const name = user?.name ?? "";
  const profileImage = user?.profileImage ?? "";
  const id = user?.id ?? "";

  // 서버 전송용 파일 상태
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const { updateProfile } = useUser(id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ password?: string; confirmPassword?: string }>({
    resolver: yupResolver(schema),
    mode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onFileChange = (file: File | null) => {
    setProfileImageFile(file);
  };

  const onSubmit = async (data: { password?: string }) => {
    const formData = new FormData();

    if (profileImageFile) {
      formData.append("profileImage", profileImageFile);
    }
    if (data.password) {
      formData.append("password", data.password);
    }
    updateProfile(formData);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="
          space-y-6 rounded-2xl shadow-lg p-8
          bg-gradient-to-br from-[var(--bg-seonday)] to-[var(--card)]
          border border-[var(--border)]
        "
      >
        {/* 프로필 영역 */}
        <div className="flex flex-col items-center space-y-2">
          <ImageUploader
            initialImageUrl={profileImage}
            onFileChange={onFileChange}
            alt="프로필 이미지"
          />
          <p className="mt-3 font-semibold text-lg text-[var(--primary)]">
            @{userId}
          </p>
          <h2 className="text-2xl font-bold text-[var(--text-base)]">
            {name}님
          </h2>
        </div>

        {/* 비밀번호 입력 */}
        <div className="space-y-4">
          <PasswordInput
            register={register}
            name="password"
            placeholder="새 비밀번호 (변경하지 않을 경우 비워두세요)"
            errors={errors}
          />
          <PasswordInput
            register={register}
            name="confirmPassword"
            placeholder="새 비밀번호 확인"
            errors={errors}
          />
        </div>

        {/* 저장 버튼 */}
        <Button
          type="submit"
          className="w-full py-3 mt-2 font-bold text-white animated-gradient-btn hover:opacity-90"
        >
          저장하기
        </Button>
      </form>
    </div>
  );
}
