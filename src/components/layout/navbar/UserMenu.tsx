import { useRef } from "react";
import Link from "next/link";
import { IoPersonCircle, IoExitOutline, IoGridOutline } from "react-icons/io5";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui/extended/UserAvatar";

interface UserMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserMenu = ({ open, onOpenChange }: UserMenuProps) => {
  const { user, logout } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = () => {
    onOpenChange(false);
    logout();
    router.replace("/auth/login");
  };

  useOnClickOutside(menuRef, () => onOpenChange(false));

  return (
    <div className="relative">
      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-55 bg-[var(--item-bg)] text-[var(--foreground)] border border-[var(--border)] rounded-xl shadow-lg ring-1 ring-black/5 z-50"
        >
          <div className="py-2">
            {/* 사용자 정보 */}
            <Link
              href="/profile"
              className="flex items-center px-4 py-3 gap-3 border-b border-[var(--border)]"
            >
              <UserAvatar src={user?.profileImage} alt={user?.name} size="xl" />
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-[var(--muted-foreground)] capitalize">
                  {user?.role || "Admin"}
                </p>
              </div>
            </Link>

            {/* 메뉴 항목 */}
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-[var(--hover-bg)] transition-colors"
              onClick={() => onOpenChange(false)}
            >
              <IoPersonCircle className="w-5 h-5 text-[var(--foreground)]" />
              Profile
            </Link>

            <Link
              href="/projectlist"
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-[var(--hover-bg)] transition-colors"
              onClick={() => onOpenChange(false)}
            >
              <IoGridOutline className="w-5 h-5 text-[var(--foreground)]" />
              프로젝트 현황
            </Link>

            <hr className="my-2 border-[var(--border)]" />

            {/* 로그아웃 */}
            <div className="p-3.5">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full gap-2 px-4 py-1.5 text-white bg-red-500 hover:bg-red-600 rounded-md"
              >
                <IoExitOutline className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
