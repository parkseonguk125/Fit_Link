"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { EmailVerificationField } from "@/components/EmailVerificationField";
import { FieldHint } from "@/components/FieldHint";
import { PasswordInput } from "@/components/PasswordInput";
import { TrainerProfileFields } from "@/components/TrainerProfileFields";
import { useDisplayNameAvailability } from "@/hooks/useDisplayNameAvailability";
import { verifyDisplayNameAvailable } from "@/lib/check-display-name-client";
import { ROLE_OPTIONS } from "@/lib/constants";
import {
  DISPLAY_NAME_TAKEN_HINT,
  getPasswordHint,
} from "@/lib/form-validation";
import {
  emptyTrainerProfile,
  type TrainerProfile,
} from "@/lib/trainer-profile";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"USER" | "TRAINER">("USER");
  const [trainerProfile, setTrainerProfile] =
    useState<TrainerProfile>(emptyTrainerProfile);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { taken: displayNameTaken } = useDisplayNameAvailability(displayName);
  const passwordHint = getPasswordHint(password);
  const displayNameHint =
    displayName.trim() && displayNameTaken ? DISPLAY_NAME_TAKEN_HINT : undefined;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!emailVerified) {
      setError("이메일 인증을 완료해 주세요.");
      return;
    }

    if (displayNameHint || passwordHint) {
      return;
    }

    const nameCheck = await verifyDisplayNameAvailable(displayName);
    if (!nameCheck.available) {
      const message = nameCheck.message ?? DISPLAY_NAME_TAKEN_HINT;
      setError(message);
      alert(message);
      return;
    }

    setLoading(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName,
        role,
        ...(role === "TRAINER" ? trainerProfile : {}),
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      const message = data.error ?? "회원가입에 실패했습니다.";
      setError(message);
      if (message === DISPLAY_NAME_TAKEN_HINT) {
        alert(message);
      }
      return;
    }

    await signOut({ redirect: false });
    window.location.replace("/login");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-[#F8F9FA] px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
      <p className="mt-2 text-sm text-gray-600">기본 정보를 입력해 주세요.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="닉네임"
            required
            className="min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#4A90A4]"
          />
          <FieldHint message={displayNameHint} />
        </div>

        <EmailVerificationField
          email={email}
          onEmailChange={setEmail}
          verified={emailVerified}
          onVerifiedChange={setEmailVerified}
        />

        <div>
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="비밀번호 (6자 이상)"
            required
            minLength={6}
            name="new-password"
          />
          <FieldHint message={passwordHint} />
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
                    : "bg-white text-gray-700 ring-1 ring-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {role === "TRAINER" ? (
            <TrainerProfileFields
              profile={trainerProfile}
              onChange={setTrainerProfile}
            />
          ) : null}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={
            loading ||
            !emailVerified ||
            Boolean(displayNameHint || passwordHint)
          }
          className="min-h-12 w-full rounded-xl bg-[#4A90A4] text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-[#4A90A4]">
          로그인
        </Link>
      </p>
    </div>
  );
}
