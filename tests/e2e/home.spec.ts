import { test, expect } from "@playwright/test";

test.describe("GameHub Home Navigation", () => {
  test("renders home page and navigates to games", async ({ page }) => {
    await page.goto("/");

    // Heading
    await expect(page.locator("h1")).toContainText("GameHub Tiếng Anh");

    // Check game cards
    const flashcardLink = page.getByRole("link", { name: /Học từ vựng/i });
    await expect(flashcardLink).toBeVisible();

    const alphabetLink = page.getByRole("link", { name: /Chữ cái & Phonics/i });
    await expect(alphabetLink).toBeVisible();

    // Click Alphabet link
    await alphabetLink.click();
    await expect(page).toHaveURL(/\/games\/alphabet/);
    await expect(page.locator("h1")).toContainText("Chữ cái & Phonics");

    // Click Back to home
    const backBtn = page.getByRole("link", { name: /Về trang chủ/i });
    await backBtn.click();
    await expect(page).toHaveURL("/");

    // Check and navigate to Listening Game card
    const listeningLink = page.getByRole("link", { name: /Nghe hiểu/i });
    await expect(listeningLink).toBeVisible();
    await listeningLink.click();
    await expect(page).toHaveURL(/\/games\/listening/);
    await expect(page.locator("h1")).toContainText("Nghe hiểu");
  });
});
