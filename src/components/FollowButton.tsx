"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toggleFollow } from "@/lib/actions";
import type { FollowState } from "@/lib/follow";

export function FollowButton({
  userId,
  initialState,
  compact = false,
}: {
  userId: string;
  initialState: FollowState;
  compact?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<FollowState>(initialState);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  const label =
    state === "accepted"
      ? "친구"
      : state === "pending"
        ? "요청됨"
        : "친구 추가";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleFollow(userId);
          setState((current) => {
            if (current === "none") {
              return "pending";
            }
            return "none";
          });
          router.refresh();
        })
      }
      className={`shrink-0 rounded-xl text-sm font-semibold disabled:opacity-60 ${
        compact ? "min-h-9 px-3" : "min-h-12 px-4"
      } ${
        state === "none"
          ? "bg-[#4A90A4] text-white"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}
