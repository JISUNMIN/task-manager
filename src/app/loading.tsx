"use client";
import Lottie from "lottie-react";
import animationData from "@/assets/images/Animation1.json";

export default function Loading() {
  return (
    <div className="flex flex-col w-full justify-center items-center min-h-screen">
      <Lottie
        animationData={animationData}
        className="w-30 h-30 sm:w-40 sm:h-40 md:w-50 md:h-50 lg:w-55 lg:h-55"
        loop
      />
    </div>
  );
}
