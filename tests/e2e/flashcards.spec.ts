import { test, expect } from "@playwright/test";

test.describe("Flashcard Game Flow", () => {
  test("selects topic, flips card, and navigates", async ({ page }) => {
    await page.goto("/games/flashcard");

    await expect(page.locator("h1")).toContainText("Học từ vựng qua Flashcard");

    // Click Animals topic
    const animalsTopic = page.getByRole("link", { name: /Động vật/i });
    await animalsTopic.click();

    await expect(page).toHaveURL(/\/games\/flashcard\/animals/);

    // Initial front face
    await expect(page.getByText("Mặt trước", { exact: true })).toBeVisible();

    // Click to flip
    const flashcard = page.locator("#flashcard-interactive");
    await flashcard.click();

    // Back face visible
    await expect(page.getByText("Mặt sau", { exact: true })).toBeVisible();

    // Click Next
    const nextBtn = page.getByRole("button", { name: /Tiếp/i });
    await nextBtn.click();

    // Card count progresses to 2
    await expect(page.getByText("2 /")).toBeVisible();
  });
});
