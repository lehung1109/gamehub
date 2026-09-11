import { test, expect } from "@playwright/test";
import { mockAnonymousStudent } from "./helpers/auth-helper";

test.describe("Word Connect Game Flow (/games/word-connect)", () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page);
  });

  test("loads Word Connect game, verifies header, board, and wheel", async ({ page }) => {
    await page.goto("/games/word-connect");

    // Verify header title "Word Connect" is visible
    await expect(page.locator("h1")).toContainText(/Word Connect/i);

    // Verify letter wheel and word slots board are rendered
    await expect(page.locator('[data-testid="word-slots-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="letter-wheel"]')).toBeVisible();
  });

  test("interacts with letter wheel and action buttons", async ({ page }) => {
    await page.goto("/games/word-connect");

    // Click first letter in the letter wheel
    const firstLetterBtn = page.locator('button[data-testid^="letter-node-"]').first();
    await expect(firstLetterBtn).toBeVisible();
    const letterChar = (await firstLetterBtn.innerText()).trim();

    await firstLetterBtn.click();

    // Verify current input displays the selected letter
    const inputDisplay = page.locator('[data-testid="current-input-display"]');
    await expect(inputDisplay).toContainText(letterChar);

    // Click Shuffle button
    const shuffleBtn = page.locator('[data-testid="shuffle-button"]');
    await expect(shuffleBtn).toBeVisible();
    await shuffleBtn.click();
  });

  test("navigates back to homepage when clicking Back button", async ({ page }) => {
    await page.goto("/games/word-connect");

    const backBtn = page.getByRole("link", { name: /Quay lại/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page).toHaveURL("/");
  });
});
