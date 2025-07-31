import { PasswordInput } from "@/components/form/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { User } from "@prisma/client";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const defaultProfileImage = "/default-profile.png";

const schema = yup.object().shape({
  password: yup
    .string()
    .min(6, "비밀번호를 6자 이상 입력해주세요.")
    .max(20, "비밀번호는 최대 20자 이내여야 합니다.")
    .required("비밀번호를 입력해주세요."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다.")
    .required("비밀번호 확인을 입력해주세요."),
});

interface UserProfileProps {
  onSave: (data: {
    password?: string;
    profileImageFile?: File;
  }) => Promise<void>;
}

export default function UserProfile({ onSave }: UserProfileProps) {
  const { user } = useAuthStore();
  const { userId, name, profileImage } = user as User;
  const [currentProfileImage, setCurrentProfileImage] = useState<string>(
    profileImage ?? defaultProfileImage
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserProfileProps>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const onChangeProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: UserProfileProps) => {
    //do somegting
  };

  return (
    <div
      className="
        w-full max-w-xl mx-auto p-6 rounded-lg shadow-md select-none
        bg-[var(--bg-seonday)] text-[var(--foreground)]
      "
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col items-center">
          <div
            className="
            relative w-32 h-32 rounded-full overflow-hidden border-4 cursor-pointer
            hover:opacity-80 transition-opacity
            border-[var(--primary)]
          "
            onClick={handleImageClick}
            title="프로필 사진 변경"
          >
            <img
              src={currentProfileImage}
              alt="프로필 이미지"
              className="w-full h-full object-cover"
            />
            <div
              className="
              absolute bottom-0 w-full text-center font-semibold py-1 opacity-0
              hover:opacity-100 transition-opacity
              bg-[rgba(0,0,0,0.4)] text-[var(--primary-foreground)]
            "
            >
              변경
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={onChangeProfileImage}
            />
          </div>

          <p className="mt-4 font-semibold text-lg text-[var(--primary)]">
            @{userId}
          </p>
          <h2 className="text-2xl font-bold text-[var(--text-base)]">
            {name}님
          </h2>
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
        {error && (
          <p className="font-semibold text-[var(--destructive)]">{error}</p>
        )}
        {success && (
          <p className="font-semibold text-[var(--accent)]">{success}</p>
        )}

        <Button type="submit" className="w-full py-3 mt-2 font-bold rounded-md">
          저장하기
        </Button>
      </form>
    </div>
  );
}
