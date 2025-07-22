import { useState } from "react";
import useComment from "@/hooks/react-query/useComment.";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/extended/UserAvatar";
import { HiOutlinePaperClip } from "react-icons/hi";
import { IoMdSend } from "react-icons/io";
import { getTimeAgo } from "@/lib/utils/helpers";
import { Edit, Trash } from "tabler-icons-react";
import { ActionDropdownMenu } from "@/components/ui/extended/ActionDropdownMenu";
import { DeleteDialog } from "@/components/ui/extended/DeleteDialog";
import { AiOutlineClose, AiOutlineCheck } from "react-icons/ai";

type Props = {
  taskId: number;
};

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

  const [newComment, setNewComment] = useState("");
  const [replyTarget, setReplyTarget] = useState<number | null>(null);
  const [replyCollapseMap, setReplyCollapseMap] = useState<
    Record<number, boolean>
  >({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [targetDeleteCommentId, setTargetDeleteCommentId] = useState<
    number | null
  >(null);

  // 댓글 수정 관련 상태
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  // 댓글 추가
  const handleAddComment = (parentCommentId: number | null = null) => {
    if (!newComment.trim() || !user) return;

    createCommentMutate({
      comment: newComment,
      userId: user.id,
      taskId,
      parentCommentId: parentCommentId ?? undefined,
    });

    setNewComment("");
    setReplyTarget(null);
  };

  // 댓글 수정 시작
  const startEditComment = (commentId: number, currentContent: string) => {
    setEditCommentId(commentId);
    setEditCommentContent(currentContent);
  };

  // 댓글 수정 취소
  const cancelEdit = () => {
    setEditCommentId(null);
    setEditCommentContent("");
  };

  // 댓글 수정 저장
  const saveEditComment = () => {
    if (!editCommentContent.trim() || editCommentId === null) return;

    updateCommentMutate({
      commentId: editCommentId,
      comment: editCommentContent,
    });

    console.log("수정된 댓글 저장:", editCommentId, editCommentContent);

    // 로컬에서 임시로 수정 반영하려면 별도 로직 필요 (예: 리팩토링 필요)
    setEditCommentId(null);
    setEditCommentContent("");
  };

  // 댓글 삭제 처리
  const handleDeleteComment = () => {
    if (targetDeleteCommentId !== null) {
      deleteCommentMutate(targetDeleteCommentId);
      setTargetDeleteCommentId(null);
    }
  };

  // 대댓글 토글
  const toggleReplies = (commentId: number) => {
    setReplyCollapseMap((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // 댓글 수정 시작 (기존 handleEditComment 대체)
  const handleEditComment = (commentId: number, currentContent: string) => {
    startEditComment(commentId, currentContent);
  };

  if (isListLoading) return <div>댓글 불러오는 중...</div>;

  return (
    <div className="p-4 border-b border-gray-300">
      {/* 댓글 리스트 */}
      <div className="space-y-4 mb-4">
        {listData?.map((comment) => {
          const canEdit =
            user?.id === Number(comment.user.userId) || user?.role === "ADMIN";
          const canDelete =
            user?.id === Number(comment.user.userId) || user?.role === "ADMIN";

          const commentItems = [
            {
              label: "댓글 수정",
              icon: <Edit />,
              onSelect: () => handleEditComment(comment.id, comment.comment),
              disabled: !canEdit,
            },
            {
              label: "댓글 삭제",
              icon: <Trash />,
              variant: "destructive" as const,
              onSelect: () => {
                setTargetDeleteCommentId(comment.id);
                setIsDeleteDialogOpen(true);
              },
              disabled: !canDelete,
            },
          ];

          return (
            <div key={comment.id} className="flex gap-2">
              <UserAvatar
                src={comment.user.profileImage ?? ""}
                alt={comment.user.name}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {comment.user.name}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-2">
                    {getTimeAgo(comment?.createdAt ?? "")}
                    <ActionDropdownMenu items={commentItems} />
                  </span>
                </div>

                {/* 수정 모드 */}
                {editCommentId === comment.id ? (
                  <div className="relative mt-1">
                    <Input
                      className="pr-16 border-none focus-visible:ring-0 hover:bg-transparent focus:bg-transparent shadow-none"
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          saveEditComment();
                        }
                        if (e.key === "Escape") {
                          cancelEdit();
                        }
                      }}
                      autoFocus
                    />
                    <div className="absolute right-2 top-1.5 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={cancelEdit}
                        title="취소"
                      >
                        <AiOutlineClose className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={saveEditComment}
                        disabled={!editCommentContent.trim()}
                        title="저장"
                      >
                        <AiOutlineCheck className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-800 mt-1">
                    {comment.comment}
                  </p>
                )}

                {/* 답글 달기 버튼 */}
                <button
                  className="text-xs text-blue-500 mt-1 hover:underline"
                  onClick={() =>
                    setReplyTarget((prev) =>
                      prev === comment.id ? null : comment.id
                    )
                  }
                >
                  {replyTarget === comment.id ? "답글 닫기" : "답글 달기"}
                </button>

                {/* 대댓글 토글 및 리스트 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2 ml-6">
                    <button
                      className="text-xs text-gray-500 hover:underline"
                      onClick={() => toggleReplies(comment.id)}
                    >
                      {replyCollapseMap[comment.id]
                        ? "▶ 대댓글 펼치기"
                        : "▼ 대댓글 숨기기"}
                    </button>

                    {!replyCollapseMap[comment.id] &&
                      comment.replies.map((reply) => {
                        const replyItems = [
                          {
                            label: "댓글 삭제",
                            icon: <Trash />,
                            variant: "destructive" as const,
                            onSelect: () => {
                              setTargetDeleteCommentId(reply.id);
                              setIsDeleteDialogOpen(true);
                            },
                          },
                        ];
                        return (
                          <div key={reply.id} className="flex gap-2 mt-3">
                            <UserAvatar
                              src={reply.user.profileImage ?? ""}
                              alt={reply.user.name}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  {reply.user.name}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {getTimeAgo(reply?.createdAt ?? "")}
                                  <ActionDropdownMenu items={replyItems} />
                                </span>
                              </div>
                              <p className="text-sm text-gray-800 mt-1">
                                {reply.comment}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* 대댓글 입력창 */}
                {replyTarget === comment.id && (
                  <div className="flex items-start gap-2 mt-3 ml-6">
                    <UserAvatar
                      src={user?.profileImage ?? ""}
                      alt={user?.name ?? "User"}
                      className="mt-1"
                    />
                    <div className="flex-1 relative">
                      <Input
                        placeholder="답글을 입력하세요"
                        className="pr-16 border-none focus-visible:ring-0 shadow-none"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(comment.id);
                          }
                        }}
                        disabled={isCreating}
                      />
                      <div className="absolute right-2 top-1.5 flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAddComment(comment.id)}
                          disabled={!newComment.trim() || isCreating}
                        >
                          <IoMdSend className="w-5 h-5 text-blue-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 일반 댓글 입력창 */}
      {!replyTarget && (
        <div className="flex items-start gap-2">
          <UserAvatar
            src={user?.profileImage ?? ""}
            alt={user?.name ?? "User"}
            className="mt-1"
          />
          <div className="flex-1 relative">
            <Input
              placeholder="댓글을 입력하세요"
              className="pr-16 border-none focus-visible:ring-0 hover:bg-transparent focus:bg-transparent shadow-none"
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
                onClick={() => handleAddComment()}
                disabled={!newComment.trim() || isCreating}
              >
                <IoMdSend className="w-5 h-5 text-blue-600" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteComment}
        title="이 댓글을 삭제하시겠습니까?"
      />
    </div>
  );
};
