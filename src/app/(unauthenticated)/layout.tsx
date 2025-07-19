"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { SunHigh, Moon } from "tabler-icons-react";

export default function UnauthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div>
      {/* 다크모드 토글 버튼 */}
      <button
        onClick={toggleTheme}
        className="btn-icon absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--hover-bg)] transition"
      >
        {theme === "light" ? <SunHigh size={24} /> : <Moon size={24} />}
      </button>
      <main>{children}</main>
    </div>
  );
}
