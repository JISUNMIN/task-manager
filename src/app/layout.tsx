import type { Metadata } from "next";
import "./globals.css";
import Toast from "@/components/ui/Toast";
import QueryProvider from "./QueryProvider";
import { cookies } from "next/headers";
import { Theme } from "@/store/useThemeStore";
import ThemeSync from "./ThemeSync";

async function getInitialTheme() {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get("theme")?.value as Theme;
  return cookieTheme ?? "dark";
}

export const metadata: Metadata = {
  title: "Squirrel Board",
  description:
    "A Kanban board for managing projects and tasks with a focus on collaboration and usability.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = await getInitialTheme();

  return (
    <html lang="ko" className={initialTheme} suppressHydrationWarning>
      <body className="antialiased">
        <QueryProvider>
          <ThemeSync initialTheme={initialTheme} />

          {children}
          <Toast />
        </QueryProvider>
      </body>
    </html>
  );
}
