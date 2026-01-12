import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Toast from "@/components/ui/Toast";
import QueryProvider from "./QueryProvider";
import UserStoreInitializer from "@/components/system/UserStoreInitializer";
import ThemeProviderLayout from "./ThemeProviderLayout";
import { cookies } from "next/headers";
import { Theme } from "@/store/useThemeStore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function getInitialTheme() {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get("theme")?.value as Theme;
  return cookieTheme ?? "dark";
}

export const metadata: Metadata = {
  title: "Squirrel Dashboard",
  description: "Welcome to your personalized Kanban board and analytics dashboard.",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = await getInitialTheme();

  return (
    <QueryProvider>
      <UserStoreInitializer />
      <html lang="en" className={initialTheme}>
        <ThemeProviderLayout geistSans={geistSans.variable} geistMono={geistMono.variable}>
          {children}
          <Toast />
        </ThemeProviderLayout>
      </html>
    </QueryProvider>
  );
}
