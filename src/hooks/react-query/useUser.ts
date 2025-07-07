import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_PATH = "api/users";

const useUser = () => {
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useQuery<User[], Error>({
    queryKey: ["users", "list"],
    queryFn: async () => {
      const res = await axios.get<User[]>(API_PATH);
      return res.data;
    },
  });

  return {
    //list
    listData,
    isListLoading,
    isListFetching,
  };
};

export default useUser;
