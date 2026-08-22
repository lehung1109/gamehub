import { test, expect } from "@playwright/test";

test.describe("Numbers & Colors Game Flow", () => {
  test("loads Numbers & Colors game from homepage, navigates numbers and colors tabs", async ({
    page,
  }) => {
    // Navigate to homepage first
    await page.goto("/");

    // Click on Numbers & Colors game card
    const gameCard = page.locator('a[href="/games/numbers-colors"]');
    await expect(gameCard).toBeVisible();
    await gameCard.click();

    // Verify page header
    await expect(page.locator("h1")).toContainText("Số & Màu sắc");

    // Check tabs
    const numbersTab = page.getByRole("tab", { name: /Số đếm/i });
    const colorsTab = page.getByRole("tab", { name: /Màu sắc/i });
    await expect(numbersTab).toBeVisible();
    await expect(colorsTab).toBeVisible();

    // Numbers learn mode: Click number 7
    const num7Btn = page.getByRole("button", { name: /^Số 7\b/i });
    await expect(num7Btn).toBeVisible();
    await num7Btn.click();

    // Detail card should display 7 - Seven
    await expect(page.getByLabel(/Chi tiết số: 7 - Seven/i)).toBeVisible();

    // Switch to Colors tab
    await colorsTab.click();

    // Colors learn mode: Click color Yellow
    const yellowBtn = page.getByRole("button", { name: /Màu Yellow/i });
    await expect(yellowBtn).toBeVisible();
    await yellowBtn.click();

    // Detail card should display Yellow
    await expect(page.getByLabel(/Chi tiết màu: Yellow/i)).toBeVisible();
  });

  test("can play Numbers Quiz mode and answer questions with feedback", async ({ page }) => {
    await page.goto("/games/numbers-colors");

    // Switch to Quiz mode
    const quizModeTab = page.getByRole("tab", { name: /Luyện tập/i });
    await expect(quizModeTab).toBeVisible();
    await quizModeTab.click();

    // Verify quiz is loaded
    await expect(page.getByText(/Câu 1 \/ 10/i)).toBeVisible({ timeout: 10000 });

    // Click first answer option
    const optionBtn = page.locator("button[aria-label^='Lựa chọn số']").first();
    await expect(optionBtn).toBeVisible();
    await optionBtn.click();

    // Feedback dialog should appear
    const feedbackDialog = page.locator('[data-slot="dialog-content"]');
    await expect(feedbackDialog).toBeVisible();

    // Click Continue
    const continueBtn = page.getByRole("button", { name: /Tiếp tục/i });
    await continueBtn.waitFor({ state: "visible", timeout: 3000 });
    await continueBtn.click();

    // Advances to Question 2
    await expect(page.getByText(/Câu 2 \/ 10/i)).toBeVisible({ timeout: 5000 });
  });

  test("can play Colors Quiz mode and complete all 10 questions to score celebration", async ({
    page,
  }) => {
    await page.goto("/games/numbers-colors");

    // Switch to Colors tab
    const colorsTab = page.getByRole("tab", { name: /Màu sắc/i });
    await expect(colorsTab).toBeVisible();
    await colorsTab.click();

    // Switch to Quiz mode
    const quizModeTab = page.getByRole("tab", { name: /Luyện tập/i });
    await expect(quizModeTab).toBeVisible();
    await quizModeTab.click();

    // Answer 10 questions
    for (let i = 1; i <= 10; i++) {
      await expect(page.getByText(new RegExp(`Câu ${i} \\/ 10`, "i"))).toBeVisible({
        timeout: 5000,
      });

      const optionBtn = page.locator("button[aria-label^='Lựa chọn màu']").first();
      await optionBtn.click();

      const continueBtn = page.getByRole("button", { name: /Tiếp tục/i });
      await continueBtn.waitFor({ state: "visible", timeout: 3000 });
      await continueBtn.click();
    }

    // Celebration screen should appear
    await expect(page.getByText(/Hoàn thành bài tập|Chúc mừng|Tuyệt đỉnh/i)).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("button", { name: /Chơi lại/i })).toBeVisible();
  });
});
