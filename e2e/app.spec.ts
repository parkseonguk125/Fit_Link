import { test, expect } from "@playwright/test";
import {
  PASSWORD,
  acceptNextDialog,
  createRecord,
  login,
  searchUser,
  signup,
  uniqueEmail,
} from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("인증", () => {
  test("로그인 후 내 기록 페이지로 이동", async ({ page }) => {
    await login(page, "user@test.com");
    await expect(page.getByRole("heading", { name: "내 기록" })).toBeVisible();
  });

  test("회원가입 닉네임 중복 경고", async ({ page }) => {
    const displayName = `중복검사${Date.now()}`;
    await signup(page, {
      displayName,
      email: uniqueEmail("dup-base"),
    });

    await page.goto("/signup");
    await page.getByPlaceholder("닉네임").fill(displayName);
    await page.getByPlaceholder("이메일").fill(uniqueEmail("dup-try"));
    await page.getByPlaceholder("비밀번호 (6자 이상)").fill(PASSWORD);

    await expect(page.getByText("이미 사용 중인 닉네임입니다.")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("button", { name: "회원가입" })).toBeDisabled();
  });
});

test.describe("친구", () => {
  test("친구 요청 및 수락", async ({ browser }) => {
    const stamp = Date.now();
    const userA = {
      displayName: `요청받는${stamp}`,
      email: uniqueEmail("follow-target"),
    };
    const userB = {
      displayName: `요청보내는${stamp}`,
      email: uniqueEmail("follow-requester"),
    };

    const setupPage = await browser.newPage();
    await signup(setupPage, userA);
    await signup(setupPage, userB);
    await setupPage.close();

    const pageB = await browser.newPage();
    await login(pageB, userB.email);
    await pageB.goto("/following");
    await pageB.getByPlaceholder("닉네임 검색").fill(userA.displayName);
    await pageB.getByRole("button", { name: "검색" }).click();
    await expect(pageB.getByText(userA.displayName).first()).toBeVisible();
    await pageB.getByRole("button", { name: "친구 추가" }).first().click();
    await expect(
      pageB.getByRole("button", { name: "요청됨" }).first(),
    ).toBeVisible();

    const pageA = await browser.newPage();
    await login(pageA, userA.email);
    await pageA.goto("/following/requests");
    await expect(pageA.getByRole("heading", { name: /^받은 친구 요청/ })).toBeVisible();
    await expect(pageA.getByText(userB.displayName)).toBeVisible();
    await pageA.getByRole("button", { name: "수락" }).click();
    await expect(pageA.getByText(userB.displayName)).not.toBeVisible({
      timeout: 15000,
    });
    await pageA.goto("/following");
    await expect(pageA.getByText(userB.displayName).first()).toBeVisible();
    await pageA.close();

    await pageB.goto("/following");
    await expect(
      pageB.getByRole("heading", { name: "나의 친구 목록" }),
    ).toBeVisible();
    await expect(pageB.getByText(userA.displayName).first()).toBeVisible();
    await pageB.close();
  });
});

test.describe("회원 탈퇴", () => {
  test("탈퇴 후 계정 삭제 및 닉네임 재사용", async ({ page }) => {
    const stamp = Date.now();
    const displayName = `탈퇴테스트${stamp}`;
    const email = uniqueEmail("delete");

    await signup(page, { displayName, email });
    await login(page, email);
    await page.goto("/me");

    acceptNextDialog(page);
    await page.getByRole("button", { name: "회원 탈퇴" }).click();
    await expect(page.getByRole("button", { name: "탈퇴 처리 중..." })).toBeHidden({
      timeout: 15000,
    });
    await page.waitForURL(/\/login/, { timeout: 15000 }).catch(() => undefined);

    await page.context().clearCookies();
    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    await page.getByPlaceholder("닉네임").fill(displayName);
    await page.getByPlaceholder("이메일").fill(uniqueEmail("reuse"));
    await page.getByPlaceholder("비밀번호 (6자 이상)").fill(PASSWORD);

    await expect(
      page.getByText("이미 사용 중인 닉네임입니다."),
    ).not.toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: "회원가입" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("기록", () => {
  const stamp = Date.now();
  const memos = {
    exercise: `e2e-운동-${stamp}`,
    diet: `e2e-식단-${stamp}`,
    cardio: `e2e-유산소-${stamp}`,
  };

  test.beforeEach(async ({ page }) => {
    await login(page, "user@test.com");
    await expect(page.getByRole("heading", { name: "내 기록" })).toBeVisible();
  });

  test("식단·운동·유산소 기록 작성", async ({ page }) => {
    await createRecord(page, {
      category: "EXERCISE",
      exercisePart: "가슴",
      memo: memos.exercise,
    });
    await createRecord(page, {
      category: "DIET",
      dietFood: "닭가슴살",
      memo: memos.diet,
    });
    await createRecord(page, {
      category: "CARDIO",
      memo: memos.cardio,
    });

    await page.goto("/me/records");
    await expect(async () => {
      await page.reload();
      await expect(page.getByText(memos.exercise).first()).toBeVisible();
      await expect(page.getByText(memos.diet).first()).toBeVisible();
      await expect(page.getByText(memos.cardio).first()).toBeVisible();
    }).toPass({ timeout: 30000 });
  });

  test("기록 삭제", async ({ page }) => {
    await page.goto("/me/records");

    for (const memo of Object.values(memos)) {
      await expect(page.getByText(memo).first()).toBeVisible();
      acceptNextDialog(page);
      const card = page
        .locator(".rounded-xl.bg-white")
        .filter({ hasText: memo })
        .first();
      await card.getByRole("button", { name: "삭제" }).click();
      await expect(page.getByText(memo)).toHaveCount(0, { timeout: 10000 });
    }
  });

  test("내 기록 캘린더 보기", async ({ page }) => {
    await page.goto("/me/records");
    await page.getByRole("link", { name: "캘린더" }).click();
    await expect(
      page.locator("p.font-semibold").filter({ hasText: /년.*월/ }),
    ).toBeVisible();
  });
});

test.describe("소셜 (시드 데이터)", () => {
  const seedExerciseMemo = "가슴 자극은 좋았지만 하단이 약한 느낌";

  test("사용자 프로필에서 공개 기록 확인", async ({ page }) => {
    await login(page, "trainer@test.com");
    await searchUser(page, "운동러");
    await expect(page.getByText("가슴").first()).toBeVisible();
    await expect(page.getByText(seedExerciseMemo)).toBeVisible();
  });

  test("트레이너 피드백 댓글 작성", async ({ page }) => {
    await login(page, "trainer@test.com");
    await searchUser(page, "운동러");
    await page.getByRole("link", { name: new RegExp(seedExerciseMemo) }).click();
    await expect(page.getByRole("heading", { name: "기록 상세" })).toBeVisible({
      timeout: 15000,
    });

    const commentBox = page.getByPlaceholder("피드백이나 조언을 남겨 주세요");
    await commentBox.fill("가슴 하단은 벤치 각도를 조금 낮춰 보세요.");
    await page.getByRole("button", { name: "피드백 남기기" }).click();

    await expect(
      page.getByRole("paragraph").filter({
        hasText: "가슴 하단은 벤치 각도를 조금 낮춰 보세요.",
      }),
    ).toBeVisible();
  });
});
