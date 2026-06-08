import { test, expect } from "@playwright/test";

const password = "password123";

test.describe("인증", () => {
  test("로그인 후 피드 페이지로 이동", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("이메일").fill("user@test.com");
    await page.getByPlaceholder("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();

    await expect(page).toHaveURL(/\/feed$/);
    await expect(page.getByRole("heading", { name: "홈 피드" })).toBeVisible();
  });

  test("회원가입 페이지 접근", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "회원가입" })).toBeVisible();
    await expect(page.getByPlaceholder("닉네임")).toBeVisible();
  });
});

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.getByPlaceholder("이메일").fill(email);
  await page.getByPlaceholder("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/feed$/);
}

test.describe("기록", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "user@test.com");
  });

  test("운동 기록 작성 및 상세 확인", async ({ page }) => {
    await page.goto("/records/new");
    await expect(page.getByRole("heading", { name: "새 기록" })).toBeVisible();

    await page.getByRole("button", { name: "식단" }).click();
    await page.getByRole("button", { name: "운동" }).click();
    await page.getByRole("button", { name: "하체" }).click();

    await page.getByRole("button", { name: "오늘 느낀 점" }).click();
    await page.getByPlaceholder("오늘 운동/식단에서 느낀 점").fill("하체 운동 자극이 좋았습니다.");

    await page.getByRole("button", { name: "기록 저장" }).click();

    await expect(page).toHaveURL(/\/records\/.+/);
    await expect(page.getByText("하체 운동 자극이 좋았습니다.")).toBeVisible();
    await expect(page.locator("span", { hasText: "하체" }).first()).toBeVisible();
  });

  test("내 기록 목록과 캘린더 보기", async ({ page }) => {
    await page.goto("/me/records");
    await expect(page.getByRole("heading", { name: "내 기록" })).toBeVisible();
    await page.getByRole("link", { name: "캘린더" }).click();
    await expect(page.locator("p.font-semibold").filter({ hasText: /년.*월/ })).toBeVisible();
  });
});

test.describe("소셜", () => {
  test("피드에서 공개 기록 확인", async ({ page }) => {
    await login(page, "trainer@test.com");
    await expect(page.getByText("운동러").first()).toBeVisible();
    await expect(page.getByText("가슴").first()).toBeVisible();
  });

  test("트레이너 피드백 댓글 작성", async ({ page }) => {
    await login(page, "trainer@test.com");
    await page.getByText("운동러").first().click();
    await expect(page.getByRole("heading", { name: "기록 상세" })).toBeVisible();

    const commentBox = page.getByPlaceholder("피드백이나 조언을 남겨 주세요");
    await commentBox.fill("가슴 하단은 벤치 각도를 조금 낮춰 보세요.");
    await expect(commentBox).toHaveValue("가슴 하단은 벤치 각도를 조금 낮춰 보세요.");
    await page.getByRole("button", { name: "피드백 남기기" }).click();

    await expect(page.getByText("가슴 하단은 벤치 각도를 조금 낮춰 보세요.")).toBeVisible();
    await expect(page.locator("span.rounded-full", { hasText: "트레이너" })).toBeVisible();
  });

  test("사용자 검색 및 팔로우", async ({ page }) => {
    await login(page, "user@test.com");
    await page.goto("/me");
    await page.getByPlaceholder("닉네임 검색").fill("김트레이너");
    await page.getByRole("button", { name: "검색" }).click();
    await page.getByText("김트레이너").click();
    await page.getByRole("button", { name: "팔로우" }).click();
    await expect(page.getByRole("button", { name: "팔로우 중" })).toBeVisible();
  });
});
