import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  isSmtpConfigured,
  sendVerificationEmail,
  shouldExposeDevCode,
} from "@/lib/email";
import { isNaverEmail } from "@/lib/form-validation";
import type { VerificationPurpose } from "@/generated/prisma/client";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const SIGNUP_VERIFIED_TTL_MS = 30 * 60 * 1000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendEmailVerificationCode(
  emailInput: string,
  purpose: VerificationPurpose,
) {
  const email = normalizeEmail(emailInput);
  if (!email) {
    return { ok: false as const, error: "이메일을 입력해 주세요.", status: 400 };
  }

  if (purpose === "SIGNUP") {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        ok: false as const,
        error: "이미 사용 중인 이메일입니다.",
        status: 409,
      };
    }
  }

  if (purpose === "PASSWORD_RESET") {
    if (!isNaverEmail(email)) {
      return {
        ok: false as const,
        error: "네이버 메일(@naver.com) 주소만 사용할 수 있습니다.",
        status: 400,
      };
    }

    if (!isSmtpConfigured() && !shouldExposeDevCode()) {
      return {
        ok: false as const,
        error:
          "메일 발송 설정이 필요합니다. .env 파일에 네이버 SMTP(앱 비밀번호)를 입력해 주세요.",
        status: 503,
      };
    }
  }

  const recent = await prisma.emailVerification.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: "desc" },
  });

  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return {
      ok: false as const,
      error: "잠시 후 다시 요청해 주세요.",
      status: 429,
    };
  }

  await prisma.emailVerification.deleteMany({
    where: { email, purpose },
  });

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.emailVerification.create({
    data: {
      email,
      codeHash,
      purpose,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  try {
    await sendVerificationEmail(
      email,
      code,
      purpose === "SIGNUP" ? "signup" : "password_reset",
    );
  } catch (error) {
    await prisma.emailVerification.deleteMany({
      where: { email, purpose },
    });

    console.error("[email-verification] send failed:", error);

    const isAuthError =
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "EAUTH";

    return {
      ok: false as const,
      error: isAuthError
        ? "네이버 SMTP 인증에 실패했습니다. 앱 비밀번호를 새로 발급해 .env의 SMTP_PASS에 넣고, POP3/SMTP 사용함 설정을 확인해 주세요."
        : "이메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      status: 500,
    };
  }

  const response: {
    ok: true;
    message: string;
    devCode?: string;
  } = {
    ok: true,
    message: `${email} 로 인증 코드를 보냈습니다. 네이버 메일함(스팸함 포함)을 확인해 주세요.`,
  };

  if (shouldExposeDevCode()) {
    response.devCode = code;
  }

  return response;
}

export async function confirmEmailVerificationCode(
  emailInput: string,
  code: string,
  purpose: VerificationPurpose,
) {
  const email = normalizeEmail(emailInput);
  const trimmedCode = code.trim();

  if (!email || !trimmedCode) {
    return {
      ok: false as const,
      error: "이메일과 인증 코드를 입력해 주세요.",
      status: 400,
    };
  }

  const record = await prisma.emailVerification.findFirst({
    where: { email, purpose, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    return {
      ok: false as const,
      error: "인증 코드가 만료되었거나 올바르지 않습니다.",
      status: 400,
    };
  }

  const valid = await bcrypt.compare(trimmedCode, record.codeHash);
  if (!valid) {
    return {
      ok: false as const,
      error: "인증 코드가 올바르지 않습니다.",
      status: 400,
    };
  }

  await prisma.emailVerification.update({
    where: { id: record.id },
    data: {
      verified: true,
      expiresAt: new Date(Date.now() + SIGNUP_VERIFIED_TTL_MS),
    },
  });

  return { ok: true as const, email };
}

export async function assertSignupEmailVerified(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const record = await prisma.emailVerification.findFirst({
    where: {
      email,
      purpose: "SIGNUP",
      verified: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    return false;
  }

  await prisma.emailVerification.deleteMany({
    where: { email, purpose: "SIGNUP" },
  });

  return true;
}

export async function resetPasswordWithCode(
  emailInput: string,
  code: string,
  password: string,
) {
  const email = normalizeEmail(emailInput);

  if (password.length < 6) {
    return {
      ok: false as const,
      error: "비밀번호는 6자 이상이어야 합니다.",
      status: 400,
    };
  }

  const confirmed = await confirmEmailVerificationCode(
    email,
    code,
    "PASSWORD_RESET",
  );

  if (!confirmed.ok) {
    return confirmed;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      ok: false as const,
      error: "가입되지 않은 이메일입니다. 먼저 회원가입을 진행해 주세요.",
      status: 404,
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await prisma.emailVerification.deleteMany({
    where: { email, purpose: "PASSWORD_RESET" },
  });

  return { ok: true as const };
}
