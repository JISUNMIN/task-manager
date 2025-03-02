"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard/kanban"); // 로그인하면 칸반으로 이동
    }
  }, [isAuthenticated, router]);

  return <LoginForm />;
}
