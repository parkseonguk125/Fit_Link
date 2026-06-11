"use client";

type CredentialsSignInResult = {
  ok: boolean;
  error?: string;
};

export async function signInWithCredentials(
  email: string,
  password: string,
  callbackPath: string,
): Promise<CredentialsSignInResult> {
  const csrfResponse = await fetch("/api/auth/csrf");
  if (!csrfResponse.ok) {
    return { ok: false, error: "로그인 요청에 실패했습니다." };
  }

  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };
  const callbackUrl = `${window.location.origin}${callbackPath}`;

  const response = await fetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({
      csrfToken,
      email: email.trim().toLowerCase(),
      password,
      callbackUrl,
    }),
  });

  let redirectUrl = callbackUrl;
  try {
    const data = (await response.json()) as { url?: string };
    redirectUrl = data.url ?? callbackUrl;
  } catch {
    return { ok: false, error: "로그인 응답을 처리하지 못했습니다." };
  }

  const error = new URL(redirectUrl, window.location.origin).searchParams.get(
    "error",
  );

  if (!response.ok || error) {
    return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  return { ok: true };
}
