import Link from "next/link";
import type { Role } from "@/generated/prisma/client";
import { RemoveFriendButton } from "@/components/RemoveFriendButton";
import { UserBadge } from "@/components/UserBadge";

export type FollowingUser = {
  id: string;
  displayName: string;
  bio: string;
  role: Role;
};

const VISIBLE_FRIEND_COUNT = 4;
const FRIEND_ROW_HEIGHT_PX = 72;
const FRIEND_ROW_GAP_PX = 12;

const FRIEND_BADGE_CLASS =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-xl px-3 text-xs font-semibold";

export function FollowingUserList({ users }: { users: FollowingUser[] }) {
  if (users.length === 0) {
    return (
      <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
        아직 친구가 없어요. 검색으로 친구를 추가해 보세요.
      </p>
    );
  }

  const scrollable = users.length > VISIBLE_FRIEND_COUNT;
  const maxHeight =
    VISIBLE_FRIEND_COUNT * FRIEND_ROW_HEIGHT_PX +
    (VISIBLE_FRIEND_COUNT - 1) * FRIEND_ROW_GAP_PX;

  return (
    <div
      className={`space-y-3 ${scrollable ? "overflow-y-auto pr-1" : ""}`}
      style={scrollable ? { maxHeight } : undefined}
    >
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
        >
          <Link
            href={`/users/${user.id}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4A90A4]/15 text-lg"
          >
            👤
          </Link>
          <Link href={`/users/${user.id}`} className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-gray-900">
                {user.displayName}
              </span>
              <UserBadge role={user.role} />
            </div>
            {user.bio ? (
              <p className="mt-0.5 truncate text-xs text-gray-500">{user.bio}</p>
            ) : (
              <p className="mt-0.5 text-xs text-gray-400">소개 없음</p>
            )}
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`${FRIEND_BADGE_CLASS} bg-gray-100 text-gray-600`}>
              친구
            </span>
            <RemoveFriendButton
              userId={user.id}
              displayName={user.displayName}
              className={FRIEND_BADGE_CLASS}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
