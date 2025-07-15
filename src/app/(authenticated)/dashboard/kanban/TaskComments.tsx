import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { IoPersonCircle } from "react-icons/io5";
import { HiOutlinePaperClip } from "react-icons/hi";
import { IoMdSend } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";
import { UserAvatar } from "@/components/ui/extended/UserAvatar";

// 가상 유저 및 댓글
const user = {
  name: "민지",
  profileImage: "",
};

const initialComments = [
  {
    id: 1,
    user,
    content: "이 작업에 대해 다시 논의해봐야 할 것 같아요.",
    createdAt: "5분 전",
  },
];

export const TaskComments = () => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        user,
        content: newComment,
        createdAt: "방금 전",
      },
    ]);
    setNewComment("");
  };

  return (
    <div className="p-4 border-b border-gray-300">
      {/* 댓글 리스트 */}
      <div className="space-y-4 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <UserAvatar
              src={comment.user.profileImage}
              alt={comment.user.name}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{comment.user.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">
                    {comment.createdAt}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-5 h-5">
                        <BsThreeDotsVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => alert("수정 예정")}>
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert("삭제 예정")}>
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 댓글 입력창 */}
      <div className="flex items-start gap-2">
        <UserAvatar src={user.profileImage} alt={user.name} className="mt-1" />
        <div className="flex-1 relative">
          <Input
            placeholder="댓글을 입력하세요"
            className="pr-16 border-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-transparent focus:bg-transparent shadow-none"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <div className="absolute right-2 top-1.5 flex gap-2">
            <Button variant="ghost" size="icon">
              <HiOutlinePaperClip className="w-5 h-5 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <IoMdSend className="w-5 h-5 text-blue-600" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
