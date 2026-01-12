"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function LogoutOnMount() {
  const { logout } = useAuthStore();

  useEffect(() => {
    logout();
  }, [logout]);

  return null;
}
