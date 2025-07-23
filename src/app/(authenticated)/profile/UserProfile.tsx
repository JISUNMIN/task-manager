import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState, useRef } from "react";

const defaultProfileImage = "/default-profile.png";

interface UserProfileProps {
  userId: string;
  name: string;
  profileImage?: string | null;
  onSave: (data: {
    password?: string;
    profileImageFile?: File;
  }) => Promise<void>;
}

export default function UserProfile({
  userId,
  name,
  profileImage,
  onSave,
}: UserProfileProps) {
  const [currentProfileImage, setCurrentProfileImage] = useState<string>(
    profileImage ?? defaultProfileImage
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await onSave({
        password: newPassword ? newPassword : undefined,
        profileImageFile: profileImageFile ?? undefined,
      });
      setSuccess("프로필이 성공적으로 저장되었습니다.");
      setNewPassword("");
      setConfirmPassword("");
      setProfileImageFile(null);
    } catch (err) {
      setError("프로필 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      className="
        w-full max-w-xl mx-auto p-6 rounded-lg shadow-md select-none
        bg-[var(--bg-seonday)] text-[var(--foreground)]
      "
    >
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
        <h2 className="text-2xl font-bold text-[var(--text-base)]">{name}님</h2>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="newPassword"
            className="block mb-1 font-medium text-[var(--text-base)]"
          >
            새 비밀번호
          </label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="새 비밀번호를 입력하세요"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block mb-1 font-medium text-[var(--text-base)]"
          >
            비밀번호 확인
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

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
