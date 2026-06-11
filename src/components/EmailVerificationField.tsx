"use client";

import { useState } from "react";
import { FieldHint } from "@/components/FieldHint";
import { getEmailHint } from "@/lib/form-validation";

type EmailVerificationFieldProps = {
  email: string;
  onEmailChange: (value: string) => void;
  verified: boolean;
  onVerifiedChange: (value: boolean) => void;
};

export function EmailVerificationField({
  email,
  onEmailChange,
  verified,
  onVerifiedChange,
}: EmailVerificationFieldProps) {
  const [code, setCode] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const emailHint = getEmailHint(email);

  async function handleSendCode() {
    setError("");
    setSendMessage("");

    if (emailHint) {
      setError(emailHint);
      return;
    }

    setSending(true);
    const response = await fetch("/api/auth/verify-email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setSending(false);

    if (!response.ok) {
      setError(data.error ?? "인증 코드 발송에 실패했습니다.");
      return;
    }

    onVerifiedChange(false);
    setSendMessage(data.message ?? "인증 코드를 보냈습니다.");
    if (data.devCode) {
      setCode(String(data.devCode));
    }
  }

  async function handleConfirmCode() {
    setError("");
    setSendMessage("");

    if (!code.trim()) {
      setError("인증 코드 6자리를 입력해 주세요.");
      return;
    }

    setConfirming(true);
    const response = await fetch("/api/auth/verify-email/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await response.json();
    setConfirming(false);

    if (!response.ok) {
      setError(data.error ?? "이메일 인증에 실패했습니다.");
      onVerifiedChange(false);
      return;
    }

    onVerifiedChange(true);
    setSendMessage("이메일 인증이 완료되었습니다.");
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm font-medium text-gray-700">이메일 인증</p>
      <div>
        <input
          type="email"
          value={email}
          onChange={(event) => {
            onEmailChange(event.target.value);
            onVerifiedChange(false);
            setSendMessage("");
            setError("");
          }}
          placeholder="이메일"
          required
          className="min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#4A90A4]"
        />
        <FieldHint message={emailHint} />
      </div>

      <button
        type="button"
        onClick={handleSendCode}
        disabled={sending || Boolean(emailHint) || !email.trim()}
        className="min-h-11 w-full rounded-xl bg-gray-900 text-sm font-medium text-white disabled:opacity-60"
      >
        {sending ? "발송 중..." : "인증 코드 받기"}
      </button>

      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(event) => {
          setCode(event.target.value.replace(/\D/g, ""));
          onVerifiedChange(false);
        }}
        placeholder="인증 코드 6자리"
        className="min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#4A90A4]"
      />

      <button
        type="button"
        onClick={handleConfirmCode}
        disabled={confirming || !code.trim()}
        className="min-h-11 w-full rounded-xl border border-[#4A90A4] text-sm font-medium text-[#4A90A4] disabled:opacity-60"
      >
        {confirming ? "확인 중..." : "인증 확인"}
      </button>

      {verified ? (
        <p className="text-sm text-green-600">이메일 인증 완료</p>
      ) : null}
      {sendMessage ? (
        <p className="text-sm text-gray-600">{sendMessage}</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
