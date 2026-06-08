import type { Role } from "@/generated/prisma/client";
import { UserBadge } from "@/components/UserBadge";
import { formatDateTime } from "@/lib/format";

export type CommentItem = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    displayName: string;
    role: Role;
  };
};

export function CommentList({ comments }: { comments: CommentItem[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-500">아직 피드백이 없습니다.</p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-xl bg-white p-4 ring-1 ring-gray-100"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {comment.user.displayName}
            </span>
            <UserBadge role={comment.user.role} />
            <span className="text-xs text-gray-400">
              {formatDateTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}
