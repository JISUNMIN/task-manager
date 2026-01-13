"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Navbar from "@/components/layout/navbar/Navbar";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const router = useRouter();

  // 주소창에 path 입력했을떄 login안되어 있을시 막기 위함
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [hasHydrated, isAuthenticated]);

  return (
    <>
      <Navbar />
      <main className="pt-14">{children}</main>
    </>
  );
}
