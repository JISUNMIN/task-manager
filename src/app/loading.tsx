"use client";
import Lottie from "lottie-react";
import animationData from "@/assets/images/Animation1.json";
export default function Loading() {
  return (
    <div className="flex flex-col w-full justify-center items-center">
      <Lottie
        animationData={animationData}
        className="flex justify-center items-center"
        loop={true}
      />
    </div>
  );
}
