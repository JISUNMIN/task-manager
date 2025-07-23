// src/store/useCommentStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type CommentState = {
  // 일반 댓글
  // 새로운 댓글 입력값
  newComment: string;
  setNewComment: (comment: string) => void;

  // 대댓글 대상 댓글의 ID (null이면 일반 댓글)
  replyTarget: number | null;
  setReplyTarget: (id: number | null) => void;

  // 댓글의 대댓글 접힘 여부 (댓글 ID → true/false)
  replyCollapseMap: Record<number, boolean>;
  toggleReplyCollapse: (id: number) => void;

  // 현재 수정 중인 댓글의 ID (null이면 수정 중 아님)
  editCommentId: number | null;
  setEditCommentId: (id: number | null) => void;

  // 수정 중인 댓글의 내용
  editCommentContent: string;
  setEditCommentContent: (content: string) => void;

  // 댓글 수정 상태 초기화 (댓글 ID와 내용 초기화)
  resetEdit: () => void;

  // 댓글 삭제 다이얼로그 열림 여부
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;

  // 삭제 대상 댓글 ID (null이면 선택 안된 상태)
  targetDeleteCommentId: number | null;
  setTargetDeleteCommentId: (id: number | null) => void;

  // 대댓글
  // 현재 수정 중인 대댓글 ID (null이면 수정 중 아님)
  editReplyId: number | null;
  setEditReplyId: (id: number | null) => void;

  // 수정 중인 대댓글 내용
  editReplyContent: string;
  setEditReplyContent: (content: string) => void;

  // 대댓글 수정 상태 초기화 (ID와 내용 초기화)
  resetEditReply: () => void;
};

export const useCommentStore = create<CommentState>()(
  devtools(
    persist(
      (set) => ({
        // 일반 댓글
        newComment: "",
        setNewComment: (comment) => set({ newComment: comment }),

        replyTarget: null,
        setReplyTarget: (id) => set({ replyTarget: id }),

        replyCollapseMap: {},
        toggleReplyCollapse: (id) =>
          set((state) => ({
            replyCollapseMap: {
              ...state.replyCollapseMap,
              [id]: !state.replyCollapseMap[id],
            },
          })),

        editCommentId: null,
        setEditCommentId: (id) => set({ editCommentId: id }),

        editCommentContent: "",
        setEditCommentContent: (content) =>
          set({ editCommentContent: content }),

        resetEdit: () => set({ editCommentId: null, editCommentContent: "" }),

        isDeleteDialogOpen: false,
        setIsDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),

        targetDeleteCommentId: null,
        setTargetDeleteCommentId: (id) => set({ targetDeleteCommentId: id }),

        // 대댓글
        editReplyId: null,
        setEditReplyId: (id) => set({ editReplyId: id }),

        editReplyContent: "",
        setEditReplyContent: (content) => set({ editReplyContent: content }),

        resetEditReply: () => set({ editReplyId: null, editReplyContent: "" }),
      }),
      {
        name: "comment-store",
      }
    )
  )
);
