import { test, expect } from "@playwright/test";
import { mockAnonymousStudent } from "./helpers/auth-helper";

test.describe("Odd One Out Game Flow (/games/odd-one-out)", () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page);
  });

  test("loads Odd One Out game and renders header and 4 semantic cards", async ({ page }) => {
    await page.goto("/games/odd-one-out");

    // Verify header title "Odd One Out" and subtitle "Truy Tìm Kẻ Lạc Loài" are visible
    await expect(page.locator("h1")).toContainText("Odd One Out");
    await expect(page.getByText("Truy Tìm Kẻ Lạc Loài")).toBeVisible();

    // Verify 4 semantic word cards are rendered
    const cards = page.locator('[data-testid^="semantic-card-"]');
    await expect(cards).toHaveCount(4);
  });

  test("selects a card, checks answer, and displays explanation banner", async ({ page }) => {
    await page.goto("/games/odd-one-out");

    const cards = page.locator('[data-testid^="semantic-card-"]');
    await expect(cards).toHaveCount(4);

    // Click the first card to select it
    const firstCard = cards.first();
    await firstCard.click();
    await expect(firstCard).toHaveAttribute("aria-pressed", "true");

    // Click "Kiểm tra đáp án" button
    const checkBtn = page.getByRole("button", { name: /Kiểm tra đáp án/i });
    await expect(checkBtn).toBeEnabled();
    await checkBtn.click();

    // Verify explanation banner appears
    const explanationBanner = page.locator('[data-testid="explanation-banner"]');
    await expect(explanationBanner).toBeVisible();
    await expect(explanationBanner).toContainText(/(Chính xác|Chưa chính xác)/i);
  });

  test("navigates back to homepage when clicking Back button", async ({ page }) => {
    await page.goto("/games/odd-one-out");

    const backBtn = page.getByRole("link", { name: /Quay lại/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page).toHaveURL("/");
  });
});
