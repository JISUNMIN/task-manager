import { PasswordInput } from "@/components/form/PasswordInput";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import * as yup from "yup";
import useUser from "@/hooks/react-query/useUser";
import { ImageUploader } from "@/components/shared/editor/ImageUploader";

type FormData = {
  profileImage?: File | null;
  password?: string | null;
  confirmPassword?: string | null;
};

const schema = yup.object().shape({
  profileImage: yup.mixed<File>().when("password", {
    is: (password: string) => !password?.length,
    then: (schema) => schema.required("프로필 이미지를 업로드해주세요."),
    otherwise: (schema) => schema.notRequired(),
  }),
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
  confirmPassword: yup.string().when("password", {
    is: (password: string) => !!password?.length,
    then: (schema) =>
      schema
        .required("비밀번호 확인을 입력해주세요.")
        .oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다."),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function UserProfile() {
  const { user } = useAuthStore();
  const userId = user?.userId ?? "";
  const name = user?.name ?? "";
  const profileImage = user?.profileImage ?? "";
  const id = user?.id ?? "";
  const methods = useForm<FormData>({
    resolver: yupResolver(schema) as unknown as Resolver<FormData>,
    mode: "onBlur",
    defaultValues: {
      profileImage: null,
      password: null,
      confirmPassword: null,
    },
  });

  // 서버 전송용 파일 상태
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const { updateProfile } = useUser(id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onFileChange = (file: File | null) => {
    setProfileImageFile(file);
  };

  const onSubmit = async (data: FormData) => {
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
      <FormProvider {...methods}>
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
              name="profileImage"
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
      </FormProvider>
    </div>
  );
}
