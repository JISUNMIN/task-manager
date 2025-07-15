// components/ui/extended/UserAvatar.tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IoPersonCircle } from "react-icons/io5";
import clsx from "clsx";

type UserAvatarProps = {
  src?: string;
  alt?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "gray" | "default";
};

const sizeClasses = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const colorClasses = {
  gray: "text-gray-500",
  default: "",
};

export const UserAvatar = ({
  src = "",
  alt = "사용자",
  className = "",
  size = "md",
  color = "default",
}: UserAvatarProps) => {
  return (
    <Avatar className={clsx(sizeClasses[size], className)}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>
        <IoPersonCircle
          className={clsx(sizeClasses[size], colorClasses[color])}
        />
      </AvatarFallback>
    </Avatar>
  );
};
