"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { SunHigh, Moon } from "tabler-icons-react";

import LoginForm from "./LoginForm";

export default function LoginPage() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div>
      {/* 다크모드 토글 버튼 */}
      <button
        onClick={toggleTheme}
        className="btn-icon absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition text-[var(--foreground)]"
      >
        {theme === "light" ? <SunHigh size={24} /> : <Moon size={24} />}
      </button>

      {/* 로그인 폼 */}
      <LoginForm />
    </div>
  );
}
