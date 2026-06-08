"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleFollow } from "@/lib/actions";

export function FollowButton({
  userId,
  initialFollowing,
}: {
  userId: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleFollow(userId);
          router.refresh();
        })
      }
      className={`min-h-12 rounded-xl px-4 text-sm font-semibold ${
        initialFollowing
          ? "bg-gray-100 text-gray-700"
          : "bg-[#4A90A4] text-white"
      }`}
    >
      {initialFollowing ? "팔로우 중" : "팔로우"}
    </button>
  );
}
