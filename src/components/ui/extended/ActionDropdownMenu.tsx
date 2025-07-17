"use client";

import React, { ReactNode, useState } from "react";
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
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Tags } from "lucide-react";
import { ProjectLabel } from "@prisma/client";
import { ClientProject } from "@/hooks/react-query/useProjects";
import { useOptionalFormContext } from "@/hooks/useOptionalFormContext"; 

interface DropdownActionItem {
  label?: string;
  icon?: ReactNode;
  onSelect?: () => void;
  className?: string;
  variant?: "default" | "destructive" | undefined;
}

interface ActionDropdownMenuProps {
  items: DropdownActionItem[];
  title?: string;
  labels?: readonly string[];
  handleSelectedLabel?: (label: ProjectLabel) => void;
  project?: ClientProject;
}

export function ActionDropdownMenu({
  items,
  title,
  labels,
  handleSelectedLabel,
  project,
}: ActionDropdownMenuProps) {
  const formContext = useOptionalFormContext();
  const setValue = formContext?.setValue;

  const [open, setOpen] = useState(false);
  const showLabelMenu = labels && handleSelectedLabel;

  const onClickDropdownMenu = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>
  ) => {
    if (project && setValue) {
      setValue("projectId", project.id);
    }
    e.stopPropagation();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-gray-200">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={onClickDropdownMenu}
        align="end"
        className="w-[200px]"
      >
        <DropdownMenuLabel>{title ?? "페이지"}</DropdownMenuLabel>
        <DropdownMenuGroup>
          {items.map((item) => (
            <DropdownMenuItem
              key={item.label}
              onSelect={() => {
                item.onSelect?.();
                setOpen(false);
              }}
              variant={item.variant}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
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
                              handleSelectedLabel(value as ProjectLabel);
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
