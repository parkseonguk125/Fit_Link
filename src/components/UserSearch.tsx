"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { searchUsers } from "@/lib/actions";
import { FollowButton } from "@/components/FollowButton";
import { UserBadge } from "@/components/UserBadge";
import type { FollowState } from "@/lib/follow";

type SearchResult = {
  id: string;
  displayName: string;
  bio: string;
  role: "USER" | "TRAINER";
  followState: FollowState;
};

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const showResults = searchedQuery !== null;

  function runSearch() {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchedQuery(null);
      setResults([]);
      return;
    }

    startTransition(async () => {
      const users = await searchUsers(trimmed);
      setResults(users);
      setSearchedQuery(trimmed);
    });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setSearchedQuery(null);
      setResults([]);
    } else if (searchedQuery !== null && value.trim() !== searchedQuery) {
      setSearchedQuery(null);
      setResults([]);
    }
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch();
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-1 text-base font-semibold text-gray-900">사용자 검색</h2>
      <p className="mb-3 text-xs text-gray-500">
        닉네임으로 검색해 친구를 추가할 수 있어요.
      </p>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder="닉네임 검색"
          className="min-h-12 flex-1 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#4A90A4]"
        />
        <button
          type="button"
          disabled={isPending}
          onClick={runSearch}
          className="min-h-12 rounded-xl bg-[#4A90A4] px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          검색
        </button>
      </form>

      {showResults ? (
        <div className="mt-4 space-y-3">
          {results.length === 0 ? (
            <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              검색 결과가 없어요.
            </p>
          ) : (
            results.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
              >
                <Link
                  href={`/users/${user.id}`}
                  className="min-w-0 flex-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-gray-900">
                      {user.displayName}
                    </span>
                    <UserBadge role={user.role} />
                  </div>
                  {user.bio ? (
                    <p className="mt-1 truncate text-xs text-gray-500">{user.bio}</p>
                  ) : null}
                </Link>
                <FollowButton
                  userId={user.id}
                  initialState={user.followState}
                  compact
                />
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
