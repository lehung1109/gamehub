import { test, expect } from "@playwright/test";

test.describe("Word Knight: RPG Battle E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        "gamehub_student_session",
        JSON.stringify({ isAnonymous: true })
      );
    });
  });

  test("renders game page, starts turn, and allows action selection", async ({ page }) => {
    await page.goto("/games/vocab-defense");
    await expect(page.getByText("Word Knight")).toBeVisible();
    await expect(page.getByText("Forest Slime")).toBeVisible();

    // Start turn if intro banner is active
    const startButton = page.getByRole("button", { name: /Vào Trận Ngay/i });
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    // Click attack action
    const attackButton = page.getByRole("button", { name: /Tấn Công Thường/i });
    await attackButton.click();

    // Challenge drawer should open
    await expect(page.getByText(/Thử thách Từ vựng/i)).toBeVisible();
  });
});
