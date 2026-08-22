import { test, expect } from "@playwright/test";

test.describe("Alphabet & Phonics Quiz Flow", () => {
  test("loads Alphabet page, switches to Quiz mode, answers questions without crashing or shifting layout", async ({
    page,
  }) => {
    // Navigate to alphabet game
    await page.goto("/games/alphabet");

    // Expect header to be visible
    await expect(page.locator("h1")).toContainText("Chữ cái & Phonics");

    // Click Quiz tab
    const quizTab = page.getByRole("tab", { name: /Luyện tập/i });
    await expect(quizTab).toBeVisible();
    await quizTab.click();

    // Verify Quiz interface loaded
    await expect(page.getByText(/Câu 1 \/ 10/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Bé hãy nghe và chọn chữ cái đúng nhé!/i)).toBeVisible();

    // Get the initial viewport scroll state
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Find and click the first option button
    const firstOption = page.locator("button:has(span.tracking-wider)").first();
    await expect(firstOption).toBeVisible();
    await firstOption.click();

    // Check feedback overlay is shown
    const feedbackDialog = page.locator('[data-slot="dialog-content"]');
    await expect(feedbackDialog).toBeVisible();

    // Verify window scroll position remained stable (no flicker jump)
    const afterClickScrollY = await page.evaluate(() => window.scrollY);
    expect(afterClickScrollY).toBe(initialScrollY);

    // Click continue button
    const continueBtn = page.getByRole("button", { name: /Tiếp tục/i });
    await continueBtn.waitFor({ state: "visible", timeout: 3000 });
    await continueBtn.click();

    // Question 2 should now be visible
    await expect(page.getByText(/Câu 2 \/ 10/i)).toBeVisible({ timeout: 5000 });
  });

  test("can complete quiz and view celebration score card", async ({ page }) => {
    await page.goto("/games/alphabet");

    const quizTab = page.getByRole("tab", { name: /Luyện tập/i });
    await expect(quizTab).toBeVisible();
    await quizTab.click();

    // Answer all 10 questions
    for (let i = 1; i <= 10; i++) {
      await expect(page.getByText(new RegExp(`Câu ${i} \\/ 10`, "i"))).toBeVisible({
        timeout: 5000,
      });

      const optionBtn = page.locator("button:has(span.tracking-wider)").first();
      await optionBtn.click();

      const continueBtn = page.getByRole("button", { name: /Tiếp tục/i });
      await continueBtn.waitFor({ state: "visible", timeout: 3000 });
      await continueBtn.click();
    }

    // Should see final score celebration screen
    await expect(page.getByText(/Hoàn thành bài tập|Chúc mừng|Tuyệt đỉnh/i)).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("button", { name: /Chơi lại/i })).toBeVisible();
  });
});
