"use client";

import { useEffect } from "react";
import { useThemeStore, type Theme } from "@/store/useThemeStore";

export default function ThemeSync({ initialTheme }: { initialTheme: Theme }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    const next: Theme = theme ?? initialTheme;
    root.classList.remove("dark", "light");
    root.classList.add(next);

    document.cookie = `theme=${next}; path=/; max-age=31536000`;
  }, [theme, initialTheme]);

  return null;
}
