"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useFriendRequestBadge } from "@/lib/friend-request-badge-client";

export function FriendRequestStatCard({
  initialCount,
  initialUnread,
}: {
  initialCount: number;
  initialUnread: boolean;
}) {
  const live = useFriendRequestBadge();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const useLive = mounted && live.ready;
  const count = useLive ? live.count : initialCount;
  const showBadge = useLive ? live.unread : initialUnread;

  return (
    <Link
      href="/following/requests"
      className="relative rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100 active:scale-[0.98]"
    >
      {showBadge ? (
        <span
          aria-label="새 친구 요청"
          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"
        />
      ) : null}
      <p className="font-semibold text-gray-900">{count}</p>
      <p className="text-xs text-gray-500">친구요청</p>
    </Link>
  );
}
