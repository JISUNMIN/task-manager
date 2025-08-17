// src/lib/axios.ts
import axios from "axios";
import Router from "next/router"; 
import { useAuthStore } from "@/store/useAuthStore"; 

const axiosInstance = axios.create({
  baseURL: "/api",
  // withCredentials: true, // 쿠키 같이 보낼 거면 필요
});

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 1) 상태 초기화 (로그아웃)
      useAuthStore.getState().logout?.();

      // 2) 로그인 페이지로 이동
      Router.replace("/auth/login");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
