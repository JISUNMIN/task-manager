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

  // 바깥 클릭 시 메뉴 닫기
  useOnClickOutside(menuRef, () => onOpenChange(false));

  return (
    <div className="relative">
      {/* 드롭다운 메뉴 */}
      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-55 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-50"
        >
          <div className="py-2">
            {/* 사용자 정보 */}
            <div className="flex items-center px-4 py-3 gap-3 border-b">
              <UserAvatar
                src={user?.profileImage ?? ""}
                alt={user?.name}
                size="xl"
              />

              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {user?.role || "Admin"}
                </p>
              </div>
            </div>

            {/* 메뉴 항목 */}
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100"
              onClick={() => onOpenChange(false)}
            >
              <IoPersonCircle className="w-5 h-5 text-gray-500" />
              Profile
            </Link>

            <Link
              href="/projectlist"
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100"
              onClick={() => onOpenChange(false)}
            >
              <IoGridOutline className="w-5 h-5" />
              프로젝트 현황
            </Link>

            {/* <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100"
              onClick={() => onOpenChange(false)}
            >
              <IoSettingsSharp className="w-5 h-5" />
              Settings
            </Link> */}

            {/* <Link
              href="/faq"
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100"
              onClick={() => onOpenChange(false)}
            >
              <IoHelpCircleSharp className="w-5 h-5" />
              FAQ
            </Link> */}

            <hr className="my-2" />

            {/* 로그아웃 */}
            <div className="p-3.5">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center  w-full gap-2 px-4 py-1.5 text-white bg-red-500 hover:bg-red-600 rounded-md"
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
