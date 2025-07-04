"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { IoPersonCircle } from "react-icons/io5";
import { User } from "@prisma/client";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";

interface UserSelectInputProps {
  value: number[];
  onChange: (users: number[]) => void;
  placeholder?: string;
  maxSelectable?: number;
}

export function UserSelectInput({
  value = [],
  onChange,
  placeholder = "사용자 검색",
  maxSelectable = 5,
}: UserSelectInputProps) {
  const { users } = useUserStore();
  const [inputValue, setInputValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<boolean | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const selectedUsers = users.filter((user) => value.includes(user.id));

  const filteredUsers =
    users?.filter(
      (user) =>
        user.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        user.userId.toLowerCase().includes(inputValue.toLowerCase())
    ) ?? [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const selectedEl = itemRefs.current[selectedIndex];
    selectedEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  const toggleUser = (user: User) => {
    // value: 현재값
    // isAlreadySelected:해당 값이 선택 되어있는지 여부: 처음 선택 시 fasle ,한번더 선택시 true
    const isAlreadySelected = value.includes(user.id);

    if (isAlreadySelected) {
      onChange(value.filter((id) => id !== user.id));
      setError(false);
    } else if (value.length >= maxSelectable) {
      setError(true);
      return;
    } else {
      onChange([...value, user.id]);
      setError(false);
    }

    setInputValue("");
    setDropdownOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen || filteredUsers.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredUsers.length - 1 : prev - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const user = filteredUsers[selectedIndex];
      if (user) toggleUser(user);
    }

    if (e.key === "Escape") {
      setDropdownOpen(false);
      setSelectedIndex(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md border border-gray-300 rounded-md px-3 py-2 flex flex-wrap items-center gap-2 bg-white shadow-sm"
      onClick={() => inputRef.current?.focus()}
    >
      {/* 선택된 사용자들 */}
      {selectedUsers.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-1 text-sm"
        >
          <Avatar className="w-5 h-5">
            <AvatarImage src={user.profileImage ?? ""} alt={user.name} />
            <AvatarFallback>
              <IoPersonCircle className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <span>{user.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleUser(user);
            }}
            className="ml-1 text-xs hover:text-primary/70"
            type="button"
          >
            ×
          </button>
        </div>
      ))}

      {/* 검색 input */}

      <input
        ref={inputRef}
        type="text"
        className="flex-grow min-w-[60px] border-none outline-none bg-transparent py-1 text-sm"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setDropdownOpen(true);
        }}
        onFocus={() => setDropdownOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : undefined}
      />

      {/* 드롭다운 */}
      {dropdownOpen && (
        <ul className="absolute left-0 top-full mt-1 w-full max-h-60 overflow-auto rounded-md border bg-white shadow-md z-50">
          {filteredUsers.length === 0 ? (
            <li className="p-3 text-sm text-gray-500">사용자가 없습니다.</li>
          ) : (
            filteredUsers.map((user, index) => {
              const isSelected = value.includes(user.id);
              const isHighlighted = selectedIndex === index;

              return (
                <li
                  key={user.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onClick={() => toggleUser(user)}
                  tabIndex={-1}
                  aria-selected={isHighlighted}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors",
                    isHighlighted ? "bg-gray-100" : "",
                    isSelected
                      ? "bg-primary/10 font-medium"
                      : "hover:bg-gray-100"
                  )}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={user.profileImage ?? ""}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      <IoPersonCircle className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-sm">
                    <span>{user.name}</span>
                    <span className="text-xs text-gray-500">{user.userId}</span>
                  </div>
                  {isSelected && (
                    <Check className="ml-auto h-4 w-4 text-primary" />
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
      {error && (
        <span className="text-sm text-red-500 mt-1">
          최대 {maxSelectable}명까지 선택할 수 있어요.
        </span>
      )}
    </div>
  );
}
