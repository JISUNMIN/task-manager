// src/app/ThemeProviderLayout.tsx
"use client";

import React, { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

interface Props {
  children: React.ReactNode;
  geistSans: string;
  geistMono: string;
}

export default function ThemeProviderLayout({ children, geistSans, geistMono }: Props) {
  const { theme } = useThemeStore();

  // // 1) 첫 마운트 시: zustand가 아직 hydrate 안 된 경우, SSR initialTheme을 한 번 맞춰
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);

    // 쿠키 업데이트 (1년 유효)
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
  }, [theme]);

  return <body className={`${geistSans} ${geistMono} antialiased`}>{children}</body>;
}
