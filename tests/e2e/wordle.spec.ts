import { test, expect } from "@playwright/test";
import { mockAnonymousStudent } from "./helpers/auth-helper";

test.describe("Wordle Game Flow (/games/wordle)", () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page);
  });

  test("loads Wordle game, renders header, grid, and virtual keyboard", async ({ page }) => {
    await page.goto("/games/wordle");

    // Verify header title "Wordle Master" is visible
    await expect(page.locator("h1")).toContainText("Wordle Master");

    // Verify letter tiles grid is visible
    const grid = page.locator('[data-testid="wordle-grid"]');
    await expect(grid).toBeVisible();

    // Verify virtual keyboard is visible
    const keyboard = page.locator('[data-testid="wordle-keyboard"]');
    await expect(keyboard).toBeVisible();
    await expect(page.locator('button[data-key="A"]')).toBeVisible();
  });

  test("inputs letters via virtual keyboard and physical keyboard and updates grid tiles", async ({
    page,
  }) => {
    await page.goto("/games/wordle");

    // Click virtual keyboard letter 'A'
    const keyA = page.locator('button[data-key="A"]');
    await keyA.click();

    // Verify first tile in current row has 'A'
    const firstTile = page.locator('[data-testid="wordle-tile-0"]').first();
    await expect(firstTile).toHaveText("A");

    // Type letter 'B' via physical keyboard
    await page.keyboard.press("KeyB");

    // Verify second tile has 'B'
    const secondTile = page.locator('[data-testid="wordle-tile-1"]').first();
    await expect(secondTile).toHaveText("B");
  });

  test("navigates back to homepage when clicking Back button", async ({ page }) => {
    await page.goto("/games/wordle");

    const backBtn = page.getByRole("link", { name: /Quay lại/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page).toHaveURL("/");
  });
});
