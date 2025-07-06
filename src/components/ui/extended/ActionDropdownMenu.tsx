"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Tags } from "lucide-react";
import { ProjectLabel } from "@prisma/client";

interface DropdownActionItem {
  label: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
  className?: string;
  shortcut?: string;
}

interface ActionDropdownMenuProps {
  items: DropdownActionItem[];
  labels?: readonly string[]; // optional: label 서브 메뉴 사용 시
  handleSelectedLabel?: (label: ProjectLabel) => void;
}

export function ActionDropdownMenu({
  items,
  labels,
  handleSelectedLabel,
}: ActionDropdownMenuProps) {
  const [open, setOpen] = useState(false);

  const showLabelMenu = labels && handleSelectedLabel;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(e) => e.stopPropagation()}
        align="end"
        className="w-[200px]"
      >
        <DropdownMenuLabel>페이지</DropdownMenuLabel>
        <DropdownMenuGroup>
          {items.map((item) => (
            <DropdownMenuItem
              key={item.label}
              onSelect={() => {
                item.onSelect?.();
                setOpen(false);
              }}
              className={item.className}
            >
              {/* React.cloneElement로 아이콘에 className 직접 전달 */}
              {React.isValidElement(item.icon)
                ? React.cloneElement(item.icon, { className: item.className })
                : item.icon}
              <span className="ml-2">{item.label}</span>
              {item.shortcut && (
                <DropdownMenuShortcut className={item.className}>
                  {item.shortcut}
                </DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          ))}

          {showLabelMenu && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Tags />
                  <span className="ml-2">라벨 적용</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-0">
                  <Command>
                    <CommandInput placeholder="라벨 검색" autoFocus={true} />
                    <CommandList>
                      <CommandEmpty>라벨을 찾을 수 없습니다.</CommandEmpty>
                      <CommandGroup>
                        {labels.map((label) => (
                          <CommandItem
                            key={label}
                            value={label}
                            onSelect={(value) => {
                              handleSelectedLabel(value);
                              setOpen(false);
                            }}
                          >
                            {label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
