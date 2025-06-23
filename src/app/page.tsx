"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function HomePage() {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth/login");
    } else if (hasHydrated && isAuthenticated) {
      router.replace("/dashboard/kanban");
    }
  }, [hasHydrated, isAuthenticated]);

  // 인증 상태 준비 안 됐거나 인증 안 된 경우 아무것도 렌더링하지 않음
  if (!hasHydrated || !isAuthenticated) return null;
}
