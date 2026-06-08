"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { searchUsers } from "@/lib/actions";
import { UserBadge } from "@/components/UserBadge";

type SearchResult = {
  id: string;
  displayName: string;
  bio: string;
  role: "USER" | "TRAINER";
};

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const users = await searchUsers(query);
      setResults(users);
    });
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-gray-900">사용자 검색</h2>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="닉네임 검색"
          className="min-h-12 flex-1 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#4A90A4]"
        />
        <button
          type="submit"
          disabled={isPending}
          className="min-h-12 rounded-xl bg-[#4A90A4] px-4 text-sm font-semibold text-white"
        >
          검색
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {results.map((user) => (
          <Link
            key={user.id}
            href={`/users/${user.id}`}
            className="block rounded-xl bg-gray-50 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {user.displayName}
              </span>
              <UserBadge role={user.role} />
            </div>
            {user.bio ? (
              <p className="mt-1 text-xs text-gray-500">{user.bio}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
