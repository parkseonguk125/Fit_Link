"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { DEFAULT_APP_PATH } from "@/lib/nav-tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    window.location.href = DEFAULT_APP_PATH;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-[#F8F9FA] px-6">
      <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
      <p className="mt-2 text-sm text-gray-600">운동·식단 기록에 오신 것을 환영합니다.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="이메일"
          required
          className="min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#4A90A4]"
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="비밀번호"
          required
          name="password"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="min-h-12 w-full rounded-xl bg-[#4A90A4] text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-[#4A90A4]">
          회원가입
        </Link>
      </p>
    </div>
  );
}
