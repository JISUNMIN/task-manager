import { useState } from "react";
import {
  Menu2,
  Search,
  Language,
  SunHigh,
  LayoutGridAdd,
  Bell,
} from "tabler-icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoPersonCircle } from "react-icons/io5";
import { useAuthStore } from "@/store/useAuthStore";
import UserMenu from "./UserMenu";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full flex h-14 items-center p-6 shadow-sm bg-white gap-2 mx-auto">
      {/* 메뉴 토글 버튼 (모바일) */}
      <button
        id="vertical-nav-toggle-btn"
        className="btn-icon lg:hidden -ms-3"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Menu2 size={26} />
      </button>

      {/* 검색 */}
      <div className="flex items-center cursor-pointer -ms-3 select-none">
        <button className="btn-icon">
          <Search />
        </button>
        <span className="hidden md:flex items-center text-gray-500 ms-2">
          <span className="me-2">Search</span>
          <span className="meta-key px-1 py-0.5 text-xs rounded bg-gray-100 border text-gray-700">
            ⌘K
          </span>
        </span>
      </div>

      <div className="flex-1" />

      {/* 언어 */}
      {/* <button className="btn-icon" aria-haspopup="menu">
        <Language />
      </button> */}

      {/* 다크모드 */}
      <button className="btn-icon" aria-haspopup="menu">
        <SunHigh />
      </button>

      {/* Shortcut */}
      {/* <button className="btn-icon" aria-haspopup="menu">
        <LayoutGridAdd />
      </button> */}

      {/* 알림 */}
      <button
        className="btn-icon relative me-1"
        id="notification-btn"
        onClick={() => setNotificationsOpen(!notificationsOpen)}
      >
        <Bell />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
      </button>

      {/* 아바타 */}
      <div
        className="relative cursor-pointer w-9 h-9 rounded-full overflow-hidden"
        onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
      >
        <Avatar>
          <AvatarImage src={user?.profileImage ?? ""} />
          <AvatarFallback>
            <IoPersonCircle className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-2 right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
      </div>
      {avatarMenuOpen && (
        <UserMenu
          // user={user}
          open={avatarMenuOpen}
          onOpenChange={setAvatarMenuOpen}
        />
      )}
    </div>
  );
};

export default Navbar;
