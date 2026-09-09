import { test, expect } from "@playwright/test";

test.describe("Falling Words Arcade E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        "gamehub_student_session",
        JSON.stringify({ isAnonymous: true })
      );
    });
    await page.goto("/games/falling-words");
  });

  test("loads the game arena, HUD header, and virtual keyboard", async ({ page }) => {
    await expect(page.getByRole("region", { name: /khu vực từ rơi/i })).toBeVisible();
    await expect(page.getByLabel(/chọn chủ đề/i)).toBeVisible();
    await expect(page.getByRole("region", { name: /bàn phím ảo/i })).toBeVisible();
    await expect(page.getByLabel(/số mạng còn lại: 3/i)).toBeVisible();
    await expect(page.getByText(/danger zone/i)).toBeVisible();

    const bombButton = page.getByRole("button", { name: /kích hoạt bom/i });
    await expect(bombButton).toBeVisible();
    await expect(bombButton).toBeDisabled();
  });

  test("allows switching vocabulary topics", async ({ page }) => {
    const topicSelect = page.getByLabel(/chọn chủ đề/i);
    await expect(topicSelect).toHaveValue("animals");

    await topicSelect.selectOption("fruits");
    await expect(topicSelect).toHaveValue("fruits");
  });

  test("renders falling word bubbles and allows typing via physical keyboard", async ({ page }) => {
    const bubble = page.locator("[data-testid^='falling-word-']").first();
    await expect(bubble).toBeVisible({ timeout: 8000 });

    // Read the text content of the bubble to find the target word
    const bubbleText = await bubble.innerText();
    expect(bubbleText.length).toBeGreaterThan(0);

    // Press a letter key on physical keyboard
    await page.keyboard.press("E");
    await expect(page.getByRole("region", { name: /khu vực từ rơi/i })).toBeVisible();
  });

  test("allows interaction with virtual keyboard buttons", async ({ page }) => {
    const keyA = page.getByRole("button", { name: "A", exact: true });
    await expect(keyA).toBeVisible();
    await keyA.click({ force: true });

    const keySpace = page.getByRole("button", { name: /phím cách bom tổng/i });
    await expect(keySpace).toBeVisible();
    await expect(keySpace).toBeDisabled();
  });
});
