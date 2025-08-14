"use client";

import { useState } from "react";
import { Check, Plus, Send } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "../button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { User } from "@prisma/client";
import { useUserStore } from "@/store/useUserStore";
import { IoPersonCircle } from "react-icons/io5";
import { useFormContext } from "react-hook-form";
import { UserAvatar } from "./UserAvatar";

interface UserSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onConfirm?: (...args: any[]) => void;
}

export function UserSelectionModal({
  open,
  onOpenChange,
  name,
  onConfirm,
}: UserSelectionModalProps) {
  const { setValue } = useFormContext();
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const { users } = useUserStore();

  const onClickConfirm = () => {
    onOpenChange(false);
    if (selectedUser) {
      onConfirm && onConfirm();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="gap-0 p-0 outline-none">
          <DialogHeader className="px-4 pb-4 pt-5">
            <DialogTitle>프로젝트 담당자 지정</DialogTitle>
            <DialogDescription>
              변경할 프로젝트 담당자를 선택하세요.
            </DialogDescription>
          </DialogHeader>
          <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
            <CommandInput placeholder="사용자 검색" />
            <CommandList>
              <CommandEmpty>사용자가 없습니다.</CommandEmpty>
              <CommandGroup className="p-2">
                {users.map((user) => (
                  <CommandItem
                    key={user.userId}
                    onSelect={() => {
                      if (selectedUser?.id === user.id) {
                        setSelectedUser(undefined); // 선택 해제
                        setValue(name, undefined);
                      } else {
                        setSelectedUser(user); // 선택
                        setValue(name, user.id);
                      }
                    }}
                  >
                    <Avatar className="w-5 h-5" key={user?.userId}>
                      <AvatarImage
                        src={user?.profileImage || undefined}
                        alt={user?.name}
                      />
                      <AvatarFallback>
                        <IoPersonCircle style={{ width: 24, height: 24 }} />
                      </AvatarFallback>
                    </Avatar>

                    <div className="ml-2">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.userId}
                      </p>
                    </div>
                    {selectedUser?.id === user?.id ? (
                      <Check className="ml-auto flex h-5 w-5 text-primary" />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <DialogFooter className="flex items-center border-t p-4 sm:justify-between">
            {selectedUser ? (
              <div className="flex -space-x-2 overflow-hidden gap-3 items-center">
                <UserAvatar
                  src={selectedUser?.profileImage || undefined}
                  alt={selectedUser?.name}
                />
                <div className="text-sm">{selectedUser.name}</div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                사용자를 선택하세요.
              </p>
            )}
            <Button disabled={!selectedUser} onClick={onClickConfirm}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
