import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/extended/UserAvatar";
import { getTimeAgo } from "@/lib/utils/helpers";
import { ActionDropdownMenu } from "@/components/ui/extended/ActionDropdownMenu";
import { Edit } from "tabler-icons-react";
import { AiOutlineClose, AiOutlineCheck } from "react-icons/ai";

interface ReplyItemProps {
  reply: any;
  currentUser: any;
  updateCommentMutate: (data: { commentId: number; comment: string }) => void;
}

// 대댓글 하나를 표시
// 자신의 대댓글인 경우 수정 가능
// 편집 상태 관리
// 댓글 업데이트 호출

export const ReplyItem = ({
  reply,
  currentUser,
  updateCommentMutate,
}: ReplyItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.comment);

  const canEdit =
    currentUser?.id === Number(reply.user.userId) ||
    currentUser?.role === "ADMIN";

  const saveEdit = () => {
    if (!editContent.trim()) return;
    updateCommentMutate({ commentId: reply.id, comment: editContent });
    setIsEditing(false);
  };

  const items = [
    {
      label: "댓글 수정",
      icon: <Edit />,
      onSelect: () => {
        setIsEditing(true);
        setEditContent(reply.comment);
      },
      disabled: !canEdit,
    },
  ];

  return (
    <div className="flex gap-2 mt-3">
      <UserAvatar
        src={reply.user.profileImage ?? ""}
        alt={reply.user.name}
        className="mt-1"
      />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{reply.user.name}</span>
          <span className="text-xs text-gray-400 flex items-center gap-2">
            {getTimeAgo(reply?.createdAt ?? "")}
            <ActionDropdownMenu items={items} />
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
          <p className="text-sm text-gray-800 mt-1">{reply.comment}</p>
        )}
      </div>
    </div>
  );
};
