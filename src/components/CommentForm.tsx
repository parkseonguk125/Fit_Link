"use client";

import { useState, useTransition } from "react";
import { addComment } from "@/lib/actions";

export function CommentForm({ recordId }: { recordId: string }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        await addComment(recordId, content);
        setContent("");
      } catch (commentError) {
        setError(
          commentError instanceof Error
            ? commentError.message
            : "댓글 작성 중 오류가 발생했습니다.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="피드백이나 조언을 남겨 주세요"
        rows={3}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4A90A4]"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="min-h-12 w-full rounded-xl bg-[#4A90A4] text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "등록 중..." : "피드백 남기기"}
      </button>
    </form>
  );
}
