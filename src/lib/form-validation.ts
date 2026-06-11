export const DISPLAY_NAME_TAKEN_HINT = "이미 사용 중인 닉네임입니다.";
export const EMAIL_INVALID_HINT = "올바른 이메일 형식으로 입력해 주세요.";
export const NAVER_EMAIL_HINT = "네이버 메일(@naver.com)만 입력할 수 있습니다.";
export const PASSWORD_TOO_SHORT_HINT = "비밀번호는 6자 이상 입력해 주세요.";

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function isNaverEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return false;
  }
  return /^[^\s@]+@naver\.com$/.test(trimmed);
}

export function isPasswordLongEnough(password: string): boolean {
  return password.length >= 6;
}

export function getEmailHint(email: string): string | undefined {
  if (!email.trim()) {
    return undefined;
  }
  return isValidEmail(email) ? undefined : EMAIL_INVALID_HINT;
}

export function getNaverEmailHint(email: string): string | undefined {
  if (!email.trim()) {
    return undefined;
  }
  if (!isValidEmail(email)) {
    return EMAIL_INVALID_HINT;
  }
  return isNaverEmail(email) ? undefined : NAVER_EMAIL_HINT;
}

export function getPasswordHint(password: string): string | undefined {
  if (!password) {
    return undefined;
  }
  return isPasswordLongEnough(password) ? undefined : PASSWORD_TOO_SHORT_HINT;
}

export function isSameDisplayName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
