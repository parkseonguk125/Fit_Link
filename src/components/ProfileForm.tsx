"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { updateProfile } from "@/lib/actions";
import { ROLE_OPTIONS } from "@/lib/constants";

export function ProfileForm({
  initialDisplayName,
  initialBio,
  initialRole,
}: {
  initialDisplayName: string;
  initialBio: string;
  initialRole: "USER" | "TRAINER";
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [role, setRole] = useState<"USER" | "TRAINER">(initialRole);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    startTransition(async () => {
      try {
        await updateProfile({ displayName, bio, role });
        setMessage("프로필이 저장되었습니다.");
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "저장 중 오류가 발생했습니다.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          닉네임
        </label>
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#4A90A4]"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          한 줄 소개
        </label>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4A90A4]"
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">역할</p>
        <div className="flex gap-2">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRole(option.value)}
              className={`min-h-12 flex-1 rounded-xl text-sm ${
                role === option.value
                  ? "bg-[#4A90A4] text-white"
                  : "bg-gray-50 text-gray-700 ring-1 ring-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {message ? <p className="text-sm text-green-600">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="min-h-12 w-full rounded-xl bg-[#4A90A4] text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "저장 중..." : "프로필 저장"}
      </button>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="min-h-12 w-full rounded-xl bg-gray-100 text-sm font-semibold text-gray-700"
      >
        로그아웃
      </button>
    </form>
  );
}
