"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldHint } from "@/components/FieldHint";
import { getNaverEmailHint } from "@/lib/form-validation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailHint = getNaverEmailHint(email);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (emailHint) {
      setError(emailHint);
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/forgot-password/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "인증 코드 발송에 실패했습니다.");
      return;
    }

    setMessage(data.message ?? "인증 코드를 보냈습니다.");
    const params = new URLSearchParams({ email });
    if (data.devCode) {
      params.set("devCode", String(data.devCode));
    }
    router.push(`/reset-password?${params.toString()}`);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center bg-[#F8F9FA] px-6">
      <h1 className="text-2xl font-bold text-gray-900">비밀번호 찾기</h1>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        <span className="block sm:inline">네이버 메일 주소를 입력하면,</span>{" "}
        <span className="block sm:inline">그 주소로 인증 코드 6자리가 발송됩니다.</span>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@naver.com"
            required
            className="min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#4A90A4]"
          />
          <FieldHint message={emailHint} />
        </div>

        {message ? <p className="text-sm text-gray-600">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || Boolean(emailHint)}
          className="min-h-12 w-full rounded-xl bg-[#4A90A4] text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "발송 중..." : "인증 코드 받기"}
        </button>
      </form>

      <div className="mt-4 space-y-3 text-center text-xs text-gray-500">
        <p>입력한 @naver.com 메일함·스팸함을 확인해 주세요.</p>
        <p>
          <span className="inline-block rounded-md bg-[#4A90A4]/15 px-2 py-1 font-semibold text-[#3a7284]">
            코드는 10분간 유효합니다
          </span>
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="font-medium text-[#4A90A4]">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
