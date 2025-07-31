import { PasswordInput } from "@/components/form/PasswordInput";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { Image as ImageIcon } from "lucide-react";
import useUser from "@/hooks/react-query/useUser";

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

  // 화면 미리보기용 이미지 URL
  const [currentProfileImage, setCurrentProfileImage] = useState<string>(
    profileImage || "/default-profile.png"
  );
  console.log("user ", user, "currentProfileImage", currentProfileImage);

  // 실제로 서버에 업로드할 원본 데이터 를 저장
  // formData에 append해서 서버로 전송하는 용도
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateProfileImage } = useUser(id);

  console.log("currentProfileImage", currentProfileImage);

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

  console.log("errors", errors);

  const onChangeProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        console.log("reader.result", reader.result);
        setCurrentProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: { password?: string }) => {
    setError(null);
    setSuccess(null);
    const formData = new FormData();

    try {
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
        updateProfileImage(formData);
      }
      if (data.password) {
        formData.append("password", data.password);
      }

      if (data.password) {
        // await updatePassword({ password: data.password });
      }
    } catch {
      // 에러는 mutation 훅 내 onError에서 처리 중
    }
  };

  useEffect(() => {
    setCurrentProfileImage(profileImage || "/default-profile.png");
  }, [profileImage]);

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
          <div
            className="
              relative w-32 h-32 rounded-full overflow-hidden border-4
              cursor-pointer group border-[var(--primary)]
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
                absolute inset-0 flex items-center justify-center
                bg-black/40 opacity-0 group-hover:opacity-100
                transition-opacity duration-300
              "
            >
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={onChangeProfileImage}
            />
          </div>

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
