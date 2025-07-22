import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

export type Comment = {
  id: number;
  comment: string;
  user: {
    id: number;
    userId: string;
    name: string;
    profileImage?: string | null;
  };
  createdAt?: string;
  parentCommentId?: number | null;
  replies?: Comment[];
};

type CommentCreateParams = {
  comment: string;
  userId: number;
  taskId: number;
  parentCommentId?: number;
};

const COMMENT_API_PATH = "/comments";

const useComment = (targetId?: string | number) => {
  const queryClient = useQueryClient();

  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useQuery<Comment[], Error>({
    queryKey: ["comments", targetId],
    queryFn: async () => {
      const res = await axios.get<Comment[]>(COMMENT_API_PATH, {
        params: { taskId: targetId },
      });
      return res.data;
    },
    enabled: !!targetId,
  });

  const { mutate: createTaskMutate, isPending: isCreating } = useMutation<
    void,
    Error,
    CommentCreateParams
  >({
    mutationFn: async (data) => {
      await axios.post(COMMENT_API_PATH, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", targetId] });
    },
    onError: () => {},
  });

  const { mutate: deleteTaskMutate } = useMutation<void, Error, number>({
    mutationFn: async (data) => {
      await axios.delete(`${COMMENT_API_PATH}/${data}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", targetId] });
    },
    onError: () => {},
  });

  return {
    //list
    listData,
    isListLoading,
    isListFetching,
    //create
    createTaskMutate,
    isCreating,
    //delete
    deleteTaskMutate,
  };
};

export default useComment;
