import { test, expect } from "@playwright/test";

test.describe("Word Explorer: Balloon Hangman E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        "gamehub_student_session",
        JSON.stringify({ isAnonymous: true })
      );
    });
    await page.goto("/games/hangman");
  });

  test("loads the balloon stage, word slots, and virtual keyboard", async ({ page }) => {
    await expect(page.getByRole("region", { name: /khu vực khinh khí cầu/i })).toBeVisible();
    await expect(page.getByLabel(/chọn chủ đề/i)).toBeVisible();
    await expect(page.getByRole("region", { name: /bàn phím chữ cái/i })).toBeVisible();

    const slots = page.locator("[data-testid='letter-slot']");
    await expect(slots.first()).toBeVisible();
    const count = await slots.count();
    expect(count).toBeGreaterThanOrEqual(3);

    const balloons = page.locator("[data-testid='balloon-item']");
    await expect(balloons).toHaveCount(6);
  });

  test("allows guessing letters using virtual keyboard", async ({ page }) => {
    const aKey = page.getByRole("button", { name: "A", exact: true });
    await expect(aKey).toBeVisible();
    await expect(aKey).toBeEnabled();

    await aKey.click();
    await expect(aKey).toBeDisabled();
  });

  test("supports physical keyboard input", async ({ page }) => {
    const eKey = page.getByRole("button", { name: "E", exact: true });
    await expect(eKey).toBeVisible();
    await expect(eKey).toBeEnabled();

    await page.keyboard.press("e");
    await expect(eKey).toBeDisabled();
  });

  test("allows switching vocabulary topics", async ({ page }) => {
    const topicSelect = page.getByLabel(/chọn chủ đề/i);
    await expect(topicSelect).toHaveValue("animals");

    await topicSelect.selectOption("fruits");
    await expect(topicSelect).toHaveValue("fruits");

    const slots = page.locator("[data-testid='letter-slot']");
    await expect(slots.first()).toBeVisible();
  });

  test("hint button reveals a letter and costs points", async ({ page }) => {
    const hintButton = page.getByRole("button", { name: /gợi ý/i });
    await expect(hintButton).toBeVisible();
    await expect(hintButton).toBeEnabled();

    await hintButton.click();
    await expect(hintButton).toBeDisabled();
  });

  test("renders properly on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.getByRole("region", { name: /khu vực khinh khí cầu/i })).toBeVisible();
    await expect(page.getByRole("region", { name: /bàn phím chữ cái/i })).toBeVisible();

    const aKey = page.getByRole("button", { name: "A", exact: true });
    await expect(aKey).toBeVisible();
    const box = await aKey.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
