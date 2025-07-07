// src/components/system/UserStoreInitializer.tsx

"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import useUser from "@/hooks/react-query/useUser";

const UserStoreInitializer = () => {
  const { listData } = useUser();
  const setUsers = useUserStore((state) => state.setUsers);

  useEffect(() => {
    if (listData) {
      setUsers(listData);
    }
  }, [listData, setUsers]);

  return null;
};

export default UserStoreInitializer;
