"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteRecord } from "@/lib/actions";
import { TEXT_ACTION_CLASS } from "@/lib/ui-classes";

export function DeleteRecordButton({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("이 기록을 삭제할까요?")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteRecord(recordId);
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
      aria-label="기록 삭제"
      className={`${TEXT_ACTION_CLASS} shrink-0 text-red-600 hover:bg-red-50 disabled:opacity-60`}
    >
      {isPending ? "삭제 중..." : "삭제"}
    </button>
  );
}
