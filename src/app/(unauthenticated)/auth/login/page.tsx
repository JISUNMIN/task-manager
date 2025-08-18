"use client";

import { useEffect } from "react";
import LoginForm from "./LoginForm";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const { logout } = useAuthStore();

  useEffect(() => {
    logout();
  }, [logout]);

  return <LoginForm />;
}
