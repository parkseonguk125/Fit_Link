"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { UserBadge } from "@/components/UserBadge";
import { acceptFollowRequest } from "@/lib/actions";
import type { FollowRequestUser } from "@/lib/follow-types";

export function FollowRequestList({
  requests,
}: {
  requests: FollowRequestUser[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAccept(followerId: string) {
    startTransition(async () => {
      await acceptFollowRequest(followerId);
      window.dispatchEvent(new Event("follow-requests-updated"));
      router.refresh();
    });
  }

  if (requests.length === 0) {
    return (
      <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm">
        받은 친구 요청이 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {requests.map((user) => (
        <li
          key={user.id}
          className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
        >
          <Link href={`/users/${user.id}`} className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-gray-900">
                {user.displayName}
              </p>
              <UserBadge role={user.role} />
            </div>
            {user.bio ? (
              <p className="mt-1 truncate text-sm text-gray-500">{user.bio}</p>
            ) : null}
          </Link>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleAccept(user.id)}
            className="min-h-9 shrink-0 rounded-xl bg-[#4A90A4] px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            수락
          </button>
        </li>
      ))}
    </ul>
  );
}
