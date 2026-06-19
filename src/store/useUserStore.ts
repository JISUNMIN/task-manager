// stores/useUserStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";

type UserSummary = {
  id: number;
  name: string;
  role: "USER" | "ADMIN";
  userId: string;
  profileImage: string | null;
};

type UserStore = {
  users: UserSummary[];
  setUsers: (users: UserSummary[]) => void;
};

export const useUserStore = create<UserStore>()(
  devtools((set) => ({
    users: [],
    setUsers: (users) => set({ users }),
  }))
);
