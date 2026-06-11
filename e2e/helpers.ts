import { expect, type Page } from "@playwright/test";

export const PASSWORD = "password123";

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@e2e.test`;
}

export async function verifyEmailForSignup(page: Page, email: string) {
  await page.getByRole("button", { name: "인증 코드 받기" }).click();

  const sendResponse = await page.waitForResponse(
    (response) =>
      response.url().includes("/api/auth/verify-email/send") &&
      response.request().method() === "POST",
  );
  const sendData = (await sendResponse.json()) as { devCode?: string };
  const code = sendData.devCode;

  if (!code) {
    throw new Error(
      "E2E 테스트에는 AUTH_EMAIL_DEV_EXPOSE=true 환경 변수가 필요합니다.",
    );
  }

  await page.getByPlaceholder("인증 코드 6자리").fill(code);
  await page.getByRole("button", { name: "인증 확인" }).click();
  await expect(page.getByText("이메일 인증 완료")).toBeVisible({
    timeout: 10000,
  });
}

export async function login(
  page: Page,
  email: string,
  password = PASSWORD,
) {
  await page.goto("/login");
  if (!page.url().includes("/login")) {
    await page.context().clearCookies();
    await page.goto("/login");
  }
  await page.getByPlaceholder("이메일").fill(email);
  await page.getByPlaceholder("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/me\/records$/, { timeout: 15000 });
}

export async function signup(
  page: Page,
  {
    displayName,
    email,
    password = PASSWORD,
  }: {
    displayName: string;
    email: string;
    password?: string;
  },
) {
  await page.goto("/signup");
  await page.getByPlaceholder("닉네임").fill(displayName);
  await page.getByPlaceholder("이메일").fill(email);
  await verifyEmailForSignup(page, email);
  await page.getByPlaceholder("비밀번호 (6자 이상)").fill(password);
  await page.getByRole("button", { name: "회원가입" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

export async function createRecord(
  page: Page,
  {
    category,
    memo,
    exercisePart,
    dietFood,
  }: {
    category: "DIET" | "EXERCISE" | "CARDIO";
    memo: string;
    exercisePart?: string;
    dietFood?: string;
  },
) {
  await page.goto("/records/new", { waitUntil: "networkidle" });

  if (category === "DIET") {
    await page.getByRole("button", { name: "식단" }).click();
    if (dietFood) {
      await page
        .getByPlaceholder("예: 닭가슴살, 현미밥, 방울토마토")
        .fill(dietFood);
      await page.getByRole("button", { name: "추가" }).click();
    }
  } else if (category === "EXERCISE") {
    await page.getByRole("button", { name: "운동" }).click();
    if (exercisePart) {
      await page.getByRole("button", { name: exercisePart }).click();
    }
  } else {
    await page.getByRole("button", { name: "유산소" }).click();
  }

  await page
    .getByPlaceholder("오늘 기록에 대한 메모를 자유롭게 작성해 주세요.")
    .fill(memo);
  await expect(
    page.getByPlaceholder("오늘 기록에 대한 메모를 자유롭게 작성해 주세요."),
  ).toHaveValue(memo);
  await expect(page.getByRole("button", { name: "기록 저장" })).toBeEnabled();

  await page.getByRole("button", { name: "기록 저장" }).click();
  await expect(page).toHaveURL(/\/records\/(?!new)[^/?#]+/, { timeout: 20000 });

  await expect(page.getByRole("heading", { name: "기록 상세" })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText(memo)).toBeVisible({ timeout: 15000 });
}

export function acceptNextDialog(page: Page) {
  page.once("dialog", (dialog) => dialog.accept());
}

export async function searchUser(page: Page, displayName: string) {
  await page.goto("/following", { waitUntil: "networkidle" });
  await page.getByPlaceholder("닉네임 검색").fill(displayName);
  await page.getByRole("button", { name: "검색" }).click();
  await expect(page.getByRole("link", { name: displayName })).toBeVisible({
    timeout: 10000,
  });
  await page.getByRole("link", { name: displayName }).click();
}
