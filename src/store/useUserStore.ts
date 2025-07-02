// stores/useUserStore.ts

import { create } from "zustand";
import { User } from "@prisma/client";
import { devtools, persist } from "zustand/middleware";

type UserStore = {
  users: User[];
  setUsers: (users: User[]) => void;
};

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        users: [],
        setUsers: (users) => set({ users }),
      }),
      {
        name: "user-storage",
      }
    )
  )
);
