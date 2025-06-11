"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const router = useRouter();

  // login 여부에 따라 path 결정됨
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth/login");
    } else {
      router.replace("/dashboard/kanban");
    }
  }, [hasHydrated, isAuthenticated]);

  if (!hasHydrated) return null;

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
