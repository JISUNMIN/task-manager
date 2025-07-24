import useComment from "@/hooks/react-query/useComment.";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/extended/UserAvatar";
import { HiOutlinePaperClip } from "react-icons/hi";
import { IoMdSend } from "react-icons/io";
import { DeleteDialog } from "@/components/ui/extended/DeleteDialog";
import { CommentItem } from "./CommentItem";
import { ItemSkeleton } from "@/components/ui/extended/Skeleton/ItemSkeleton";
import { useCommentStore } from "@/store/useCommentStore"; // ✅ zustand store import

type Props = {
  taskId: number;
};

// 특정 Task에 대한 전체 댓글 목록 조회
// 새로운 댓글 작성
// 댓글 삭제 다이어로그 제어
// 개별 댓글(CommentItem)을 렌더링
// 각 댓글에 use,mutattions,삭제 핸들러 전달

export const TaskComments = ({ taskId }: Props) => {
  const { user } = useAuthStore();

  const {
    listData,
    isListLoading,
    createCommentMutate,
    isCreating,
    deleteCommentMutate,
    updateCommentMutate,
  } = useComment(taskId);

  const newComment = useCommentStore((state) => state.newComment);
  const setNewComment = useCommentStore((state) => state.setNewComment);

  const isDeleteDialogOpen = useCommentStore(
    (state) => state.isDeleteDialogOpen
  );
  const setIsDeleteDialogOpen = useCommentStore(
    (state) => state.setIsDeleteDialogOpen
  );

  const targetDeleteCommentId = useCommentStore(
    (state) => state.targetDeleteCommentId
  );
  const setTargetDeleteCommentId = useCommentStore(
    (state) => state.setTargetDeleteCommentId
  );

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    createCommentMutate({
      comment: newComment,
      userId: user.id,
      taskId,
    });
    setNewComment(""); // ✅ 전역 상태 초기화
  };

  const handleDeleteComment = () => {
    if (targetDeleteCommentId !== null) {
      deleteCommentMutate(targetDeleteCommentId);
      setTargetDeleteCommentId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isListLoading) {
    return <ItemSkeleton />;
  }

  return (
    <div className="p-4 border-b border-gray-300">
      {/* 댓글 리스트 */}
      <div className="space-y-4 mb-4">
        {listData?.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            taskId={taskId}
            user={user}
            updateCommentMutate={updateCommentMutate}
            createCommentMutate={createCommentMutate}
            setTargetDeleteCommentId={setTargetDeleteCommentId}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            isCreating={isCreating}
          />
        ))}
      </div>

      {/* 일반 댓글 입력창 */}
      <div className="flex items-start gap-2">
        <UserAvatar
          src={user?.profileImage ?? ""}
          alt={user?.name ?? "User"}
          className="mt-1"
        />
        <div className="flex-1 relative">
          <Input
            placeholder="댓글을 입력하세요"
            className="pr-16 border-none focus-visible:ring-0 shadow-none"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            disabled={isCreating}
          />
          <div className="absolute right-2 top-1.5 flex gap-2">
            <Button variant="ghost" size="icon" disabled={isCreating}>
              <HiOutlinePaperClip className="w-5 h-5 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddComment}
              disabled={!newComment.trim() || isCreating}
            >
              <IoMdSend className="w-5 h-5 text-blue-600" />
            </Button>
          </div>
        </div>
      </div>

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteComment}
        title="이 댓글을 삭제하시겠습니까?"
      />
    </div>
  );
};
