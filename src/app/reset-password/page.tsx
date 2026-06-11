"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { getPasswordHint } from "@/lib/form-validation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const initialDevCode = searchParams.get("devCode") ?? "";

  const [email] = useState(initialEmail);
  const [code, setCode] = useState(initialDevCode);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordHint = getPasswordHint(password);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (passwordHint) {
      return;
    }

    if (!code.trim()) {
      setError("인증 코드 6자리를 입력해 주세요.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/forgot-password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "비밀번호 재설정에 실패했습니다.");
      return;
    }

    router.replace("/login");
  }

  if (!email) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-[#F8F9FA] px-6">
        <p className="text-sm text-gray-600">이메일 정보가 없습니다.</p>
        <Link href="/forgot-password" className="mt-4 text-sm text-[#4A90A4]">
          비밀번호 찾기로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-[#F8F9FA] px-6">
      <h1 className="text-2xl font-bold text-gray-900">비밀번호 재설정</h1>
      <p className="mt-2 text-sm text-gray-600">
        <strong>{email}</strong> 네이버 메일함에서 받은 6자리 코드와 새
        비밀번호를 입력해 주세요.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          placeholder="인증 코드 6자리"
          required
          className="min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#4A90A4]"
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="새 비밀번호 (6자 이상)"
          required
          minLength={6}
          name="new-password"
        />
        {passwordHint ? (
          <p className="text-sm text-amber-600">{passwordHint}</p>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || Boolean(passwordHint)}
          className="min-h-12 w-full rounded-xl bg-[#4A90A4] text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="font-medium text-[#4A90A4]">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center bg-[#F8F9FA] px-6 text-sm text-gray-600">
          불러오는 중...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
