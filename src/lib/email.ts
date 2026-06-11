import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

type EmailPurpose = "signup" | "password_reset";

const APP_NAME = "Fit Link";

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

function isNaverSmtp(host: string) {
  return host.includes("naver.com");
}

function getTransporterOptions(
  host: string,
  user: string,
  pass: string,
): SMTPTransport.Options {
  if (isNaverSmtp(host)) {
    const port = Number(process.env.SMTP_PORT?.trim() || 587);

    if (port === 465) {
      return {
        host: "smtp.naver.com",
        port: 465,
        secure: true,
        auth: { user, pass },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      };
    }

    return {
      host: "smtp.naver.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    };
  }

  const port = Number(process.env.SMTP_PORT?.trim() || 587);

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  };
}

function getTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport(getTransporterOptions(host, user, pass));
}

function getFromAddress() {
  const user = process.env.SMTP_USER?.trim();
  const host = process.env.SMTP_HOST?.trim() ?? "";

  if (isNaverSmtp(host) && user) {
    return user;
  }

  const from = process.env.SMTP_FROM?.trim();
  if (from) {
    return from;
  }

  if (user) {
    return `${APP_NAME} <${user}>`;
  }

  return `${APP_NAME} <noreply@fitlink.app>`;
}

function getSubject(purpose: EmailPurpose) {
  if (purpose === "signup") {
    return `[${APP_NAME}] 이메일 인증 코드`;
  }
  return `[${APP_NAME}] 비밀번호 재설정 코드`;
}

function getBody(code: string, purpose: EmailPurpose) {
  if (purpose === "signup") {
    return [
      `${APP_NAME} 회원가입을 위한 인증 코드입니다.`,
      "",
      `인증 코드: ${code}`,
      "",
      "코드는 10분간 유효합니다.",
      "본인이 요청하지 않았다면 이 메일을 무시해 주세요.",
    ].join("\n");
  }

  return [
    `${APP_NAME} 비밀번호 재설정 코드입니다.`,
    "",
    `인증 코드: ${code}`,
    "",
    "코드는 10분간 유효합니다.",
    "본인이 요청하지 않았다면 이 메일을 무시해 주세요.",
  ].join("\n");
}

export function shouldExposeDevCode() {
  return process.env.AUTH_EMAIL_DEV_EXPOSE === "true" && !isSmtpConfigured();
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  purpose: EmailPurpose,
) {
  const transporter = getTransporter();
  const subject = getSubject(purpose);
  const text = getBody(code, purpose);

  if (!transporter) {
    console.info(`[email:dev] To: ${email} | ${subject} | Code: ${code}`);
    return;
  }

  await transporter.sendMail({
    from: getFromAddress(),
    to: email,
    subject,
    text,
  });
}
