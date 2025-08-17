import { useState } from "react";
import { Menu2, Search, SunHigh, Bell, Moon } from "tabler-icons-react";
import { useAuthStore } from "@/store/useAuthStore";
import UserMenu from "./UserMenu";
import { UserAvatar } from "@/components/ui/extended/UserAvatar";
import { useThemeStore } from "@/store/useThemeStore";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full flex h-14 items-center p-6 shadow-sm bg-[var(--item-bg)] text-[var(--foreground)] gap-2 mx-auto transition-colors duration-300">
      {/* 메뉴 토글 버튼 (모바일) */}
      {/* <button
        id="vertical-nav-toggle-btn"
        className="btn-icon lg:hidden -ms-3"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Menu2 size={26} />
      </button> */}

      {/* 검색 */}
      {/* <div className="flex items-center cursor-pointer -ms-3 select-none">
        <button className="btn-icon">
          <Search />
        </button>
        <span className="hidden md:flex items-center text-gray-500 dark:text-gray-300 ms-2">
          <span className="me-2">Search</span>
          <span className="meta-key px-1 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
            ⌘K
          </span>
        </span>
      </div> */}

      <div className="flex-1" />

      {/* 언어 */}
      {/* <button className="btn-icon" >
        <Language />
      </button> */}

      {/* 다크모드 토글 */}
      <button className="btn-icon" onClick={toggleTheme}>
        {theme === "light" ? <SunHigh /> : <Moon />}
      </button>

      {/* Shortcut */}
      {/* <button className="btn-icon" >
        <LayoutGridAdd />
      </button> */}

      {/* 알림 */}
      {/* <button
        className="btn-icon relative me-1"
        id="notification-btn"
        onClick={() => setNotificationsOpen(!notificationsOpen)}
      >
        <Bell />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
      </button> */}

      {/* 아바타 */}
      <div
        className="relative cursor-pointer w-9 h-9 rounded-full overflow-hidden"
        onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
      >
        <UserAvatar
          src={user?.profileImage}
          alt={user?.userId}
          size="lg"
          className="mt-1"
        />
        <span className="absolute bottom-2 right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />
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
