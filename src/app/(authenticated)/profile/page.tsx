// app/(authenticated)/profile/page.tsx

"use client";

import { useAuthStore } from "@/store/useAuthStore";
import UserProfile from "./UserProfile";

export default function ProfilePage() {
  const handleSave = async ({
    password,
    profileImageFile,
  }: {
    password?: string;
    profileImageFile?: File;
  }) => {
    // TODO: 비밀번호 변경 API
    if (password) {
      await fetch("/api/user/password", {
        method: "POST",
        body: JSON.stringify({ password }),
        headers: { "Content-Type": "application/json" },
      });
    }

    // TODO: 프로필 이미지 업로드 API
    if (profileImageFile) {
      const formData = new FormData();
      formData.append("profileImage", profileImageFile);
      await fetch("/api/user/profile-image", {
        method: "POST",
        body: formData,
      });
    }
  };

  return (
    <div className="pt-4">
      <UserProfile onSave={handleSave} />;
    </div>
  );
}
