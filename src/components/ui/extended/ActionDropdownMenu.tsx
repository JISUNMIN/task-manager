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
import { cn } from "@/lib/utils";

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
  isOnLightBackground?: boolean;
}

export function ActionDropdownMenu({
  items,
  title,
  labels,
  handleSelectedLabel,
  project,
  isOnLightBackground,
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
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "hover:bg-gray-200 dark:hover:bg-gray-600",
            isOnLightBackground && "dark:hover:bg-gray-400"
          )}
        >
          <MoreVertical
            className={isOnLightBackground ? "text-[var(--box-text)]" : ""}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={onClickDropdownMenu}
        align="end"
        className="w-[200px] bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200"
      >
        <DropdownMenuLabel className="dark:text-gray-400">
          {title ?? "페이지"}
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {items.map((item) => (
            <DropdownMenuItem
              key={item.label}
              onSelect={() => {
                item.onSelect?.();
                setOpen(false);
              }}
              variant={item.variant}
              className="dark:hover:bg-gray-700 dark:text-gray-200"
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </DropdownMenuItem>
          ))}

          {showLabelMenu && (
            <>
              <DropdownMenuSeparator className="dark:border-gray-700" />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="dark:text-gray-200 dark:hover:bg-gray-700 flex items-center">
                  <Tags />
                  <span className="ml-2">라벨 적용</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-0 bg-white dark:bg-gray-800 dark:text-gray-200">
                  <Command>
                    <CommandInput
                      placeholder="라벨 검색"
                      autoFocus={true}
                      className="bg-white dark:bg-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <CommandList className="bg-white dark:bg-gray-800 dark:text-gray-200">
                      <CommandEmpty className="dark:text-gray-400">
                        라벨을 찾을 수 없습니다.
                      </CommandEmpty>
                      <CommandGroup>
                        {labels.map((label) => (
                          <CommandItem
                            key={label}
                            value={label}
                            onSelect={(value) => {
                              handleSelectedLabel(value as ProjectLabel);
                              setOpen(false);
                            }}
                            className="dark:hover:bg-gray-700 dark:text-gray-200"
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
