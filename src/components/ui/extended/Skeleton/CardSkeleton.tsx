import { cn } from "@/lib/utils";
import { Skeleton } from "../../skeleton";

export const CardSkeleton = ({ width }: { width?: string }) => (
  <div className="flex flex-col space-y-3">
    <Skeleton className={cn(width ? width : "h-55", "rounded-xl")} />
  </div>
);
