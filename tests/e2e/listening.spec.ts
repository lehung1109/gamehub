import { test, expect } from "@playwright/test";

test.describe("Listening Game E2E Flow (/games/listening)", () => {
  test("loads Listening Game page, verifies header, navigation, and audio replay controls", async ({
    page,
  }) => {
    // Navigate directly to listening game
    await page.goto("/games/listening");

    // Check heading
    await expect(page.locator("h1")).toContainText("Nghe hiểu");

    // Check Back button
    const backBtn = page.getByRole("link", { name: /Về trang chủ/i });
    await expect(backBtn).toBeVisible();

    // Check Replay audio button
    const replayBtn = page.getByRole("button", { name: /Nghe lại âm thanh/i });
    await expect(replayBtn).toBeVisible();

    // Check prompt instruction banner
    await expect(
      page.getByText(/Bé hãy lắng nghe và chọn hình ảnh đúng nhé!/i)
    ).toBeVisible();

    // Check topic filter pills
    await expect(page.getByRole("button", { name: /Tất cả/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Động vật/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Trái cây/i })).toBeVisible();

    // Check Question counter
    await expect(page.getByText(/Câu 1 \/ 10/i)).toBeVisible();
  });

  test("presents 4 option choices and shows feedback overlay upon selection", async ({
    page,
  }) => {
    await page.goto("/games/listening");

    // Find option buttons in the QuizEngine grid
    const optionButtons = page.locator("button[aria-label^='Lựa chọn hình ảnh']");
    await expect(optionButtons).toHaveCount(4);

    // Click the first option
    await optionButtons.first().click();

    // Feedback dialog should appear
    const dialog = page.locator('[data-slot="dialog-content"]');
    await expect(dialog).toBeVisible();

    // Should contain Continue button
    const continueBtn = page.getByRole("button", { name: /Tiếp tục/i });
    await expect(continueBtn).toBeVisible();

    // Click Continue or wait for auto-advance
    await continueBtn.click();

    // Should advance to Question 2
    await expect(page.getByText(/Câu 2 \/ 10/i)).toBeVisible({ timeout: 5000 });
  });

  test("allows filtering by specific topic (e.g. Animals, Fruits)", async ({ page }) => {
    await page.goto("/games/listening");

    // Click Fruits topic filter
    const fruitsBtn = page.getByRole("button", { name: /Trái cây/i });
    await fruitsBtn.click();

    // Should reset to Question 1 of Fruits topic
    await expect(page.getByText(/Câu 1 \/ 10/i)).toBeVisible();

    // Option buttons should still be 4 choices
    const optionButtons = page.locator("button[aria-label^='Lựa chọn hình ảnh']");
    await expect(optionButtons).toHaveCount(4);
  });

  test("can complete all 10 questions and restart the game", async ({ page }) => {
    await page.goto("/games/listening");

    // Play through all 10 questions
    for (let i = 1; i <= 10; i++) {
      await expect(page.getByText(new RegExp(`Câu ${i} \\/ 10`, "i"))).toBeVisible({
        timeout: 5000,
      });

      const optionBtn = page.locator("button[aria-label^='Lựa chọn hình ảnh']").first();
      await optionBtn.click();

      const continueBtn = page.getByRole("button", { name: /Tiếp tục/i });
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
      }
    }

    // Completion celebration screen should display
    await expect(
      page.getByText(/Hoàn thành bài tập|Chúc mừng|Tuyệt đỉnh/i)
    ).toBeVisible({ timeout: 5000 });

    // Play again button should be present
    const playAgainBtn = page.getByRole("button", { name: /Chơi lại/i });
    await expect(playAgainBtn).toBeVisible();

    // Click Play again
    await playAgainBtn.click();

    // Game restarts at Question 1
    await expect(page.getByText(/Câu 1 \/ 10/i)).toBeVisible({ timeout: 5000 });
  });
});
