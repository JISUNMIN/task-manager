// src/app/ThemeProviderLayout.tsx
"use client";

import { useThemeStore } from "@/store/useThemeStore";
import React from "react";

interface Props {
  children: React.ReactNode;
  geistSans: string;
  geistMono: string;
}

export default function ThemeProviderLayout({
  children,
  geistSans,
  geistMono,
}: Props) {
  const { theme } = useThemeStore();

  return (
    <body className={`${geistSans} ${geistMono} antialiased ${theme}`}>
      {children}
    </body>
  );
}
