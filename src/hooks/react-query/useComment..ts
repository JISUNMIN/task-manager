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

type CommentUpdateParams = {
  commentId: number;
  comment: string;
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

  // create
  const { mutate: createCommentMutate, isPending: isCreating } = useMutation<
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

  // update
  const { mutate: updateCommentMutate } = useMutation<
    void,
    Error,
    CommentUpdateParams
  >({
    mutationFn: async (data) => {
      const { comment, commentId } = data;
      await axios.patch(`${COMMENT_API_PATH}/${commentId}`, {
        comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", targetId] });
    },
    onError: () => {},
  });

  // delete
  const { mutate: deleteCommentMutate } = useMutation<void, Error, number>({
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
    createCommentMutate,
    isCreating,
    //update
    updateCommentMutate,
    //delete
    deleteCommentMutate,
  };
};

export default useComment;
