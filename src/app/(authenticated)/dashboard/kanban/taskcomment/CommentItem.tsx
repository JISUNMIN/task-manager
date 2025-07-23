import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/extended/UserAvatar";
import { getTimeAgo } from "@/lib/utils/helpers";
import { ActionDropdownMenu } from "@/components/ui/extended/ActionDropdownMenu";
import { Edit, Trash } from "tabler-icons-react";
import { AiOutlineClose, AiOutlineCheck } from "react-icons/ai";
import { IoMdSend } from "react-icons/io";
import { ReplyItem } from "./ReplyItem";

export interface CommentItemProps {
  comment: any;
  taskId: number;
  user: any;
  updateCommentMutate: any;
  createCommentMutate: any;
  setTargetDeleteCommentId: (id: number) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isCreating: boolean;
}

// 단일 댓글 + 그에 대한 대댓글(ReplyItem) 목록 
// 답급 입력창
// 해당 댓글에 대한 수정/삭제 버튼 표시 및 제어
// 대댓글 리스트 보여주기/숨기기

export const CommentItem = ({
  comment,
  taskId,
  user,
  updateCommentMutate,
  createCommentMutate,
  setTargetDeleteCommentId,
  setIsDeleteDialogOpen,
  isCreating,
}: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.comment);
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const canEdit =
    user?.id === Number(comment.user.userId) || user?.role === "ADMIN";
  const canDelete = canEdit;

  const saveEdit = () => {
    if (!editContent.trim()) return;
    updateCommentMutate({ commentId: comment.id, comment: editContent });
    setIsEditing(false);
  };

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    createCommentMutate({
      comment: replyContent,
      userId: user.id,
      taskId,
      parentCommentId: comment.id,
    });
    setReplyContent("");
    setShowReplyInput(false);
  };

  const commentItems = [
    {
      label: "댓글 수정",
      icon: <Edit />,
      onSelect: () => setIsEditing(true),
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
    <div className="flex gap-2">
      <UserAvatar
        src={comment.user.profileImage ?? ""}
        alt={comment.user.name}
        className="mt-1"
      />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{comment.user.name}</span>
          <span className="text-xs text-gray-400 flex items-center gap-2">
            {getTimeAgo(comment?.createdAt ?? "")}
            <ActionDropdownMenu items={commentItems} />
          </span>
        </div>

        {isEditing ? (
          <div className="relative mt-1">
            <Input
              className="pr-16 border-none focus-visible:ring-0 shadow-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                }
                if (e.key === "Escape") setIsEditing(false);
              }}
              autoFocus
            />
            <div className="absolute right-2 top-1.5 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
              >
                <AiOutlineClose className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={saveEdit}
                disabled={!editContent.trim()}
              >
                <AiOutlineCheck className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-800 mt-1">{comment.comment}</p>
        )}

        <Button
          variant="link"
          className="text-xs text-blue-500 mt-1"
          onClick={() => setShowReplyInput((prev) => !prev)}
        >
          {showReplyInput ? "답글 닫기" : "답글 달기"}
        </Button>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 ml-6">
            <button
              className="text-xs text-gray-500"
              onClick={() => setShowReplies((prev) => !prev)}
            >
              {showReplies ? "▼ 대댓글 숨기기" : "▶ 대댓글 펼치기"}
            </button>

            {showReplies &&
              comment.replies.map((reply: any) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  currentUser={user}
                  updateCommentMutate={updateCommentMutate}
                />
              ))}
          </div>
        )}

        {showReplyInput && (
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
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReplySubmit();
                  }
                }}
                disabled={isCreating}
              />
              <div className="absolute right-2 top-1.5 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim() || isCreating}
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
};
