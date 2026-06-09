"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { removeFriend } from "@/lib/actions";

export function RemoveFriendButton({
  userId,
  displayName,
  className = "",
}: {
  userId: string;
  displayName: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`${displayName}님을 친구 목록에서 삭제할까요?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await removeFriend(userId);
        router.refresh();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "삭제 중 오류가 발생했습니다.",
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`${displayName} 친구 삭제`}
      className={`${className} bg-red-50 text-red-600 disabled:opacity-60`}
    >
      {isPending ? "삭제 중..." : "삭제"}
    </button>
  );
}
