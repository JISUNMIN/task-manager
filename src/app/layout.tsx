import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Toast from "@/components/ui/Toast";
import QueryProvider from "./QueryProvider";
import UserStoreInitializer from "@/components/system/UserStoreInitializer";
import ThemeProviderLayout from "./ThemeProviderLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Squirrel Dashboard",
  description:
    "Welcome to your personalized Kanban board and analytics dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <UserStoreInitializer />
      <html lang="en">
        <ThemeProviderLayout
          geistSans={geistSans.variable}
          geistMono={geistMono.variable}
        >
          {children}
          <Toast />
        </ThemeProviderLayout>
      </html>
    </QueryProvider>
  );
}
