import { test, expect } from "@playwright/test";

test.describe("Simple Sentences Game E2E Flow (/games/sentences)", () => {
  test("loads Sentences Game page, verifies header, navigation, and sentence prompt controls", async ({
    page,
  }) => {
    await page.goto("/games/sentences");

    // Check heading
    await expect(page.locator("h1")).toContainText("Luyện câu đơn giản");

    // Check Back button
    const backBtn = page.getByRole("link", { name: /Về trang chủ/i });
    await expect(backBtn).toBeVisible();

    // Check Speaker button
    const speakBtn = page.getByRole("button", { name: /Nghe câu mẫu/i });
    await expect(speakBtn).toBeVisible();

    // Check category filter buttons
    await expect(page.getByRole("button", { name: /Tất cả/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Hành động/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Động vật/i })).toBeVisible();

    // Check Question counter and score
    await expect(page.getByText(/Câu 1 \/ \d+/i)).toBeVisible();
    await expect(page.getByText(/Điểm: \d+/i)).toBeVisible();

    // Check Drop slots and Word bank
    const dropSlots = page.locator("button[aria-label^='Ô từ ']");
    const slotCount = await dropSlots.count();
    expect(slotCount).toBeGreaterThanOrEqual(2);
    expect(slotCount).toBeLessThanOrEqual(5);

    const bankWords = page.locator("button[aria-label^='Từ ']");
    const bankCount = await bankWords.count();
    expect(bankCount).toBe(slotCount);
  });

  test("allows placing words into slots via tap-to-place and removing them by clicking slot", async ({
    page,
  }) => {
    await page.goto("/games/sentences");

    const dropSlots = page.locator("button[aria-label^='Ô từ ']");
    const firstSlot = dropSlots.first();
    await expect(firstSlot).toBeVisible();

    const availableBankWords = page.locator("button[aria-label^='Từ ']:not([disabled])");
    const firstBankWord = availableBankWords.first();
    await expect(firstBankWord).toBeVisible();

    const wordText = (await firstBankWord.innerText()).trim();

    // Click bank word to place in slot
    await firstBankWord.click();

    // First slot should now have the word
    await expect(firstSlot).toHaveText(wordText);

    // Click the slot to remove the word back to bank
    await firstSlot.click();
    await expect(firstSlot).toHaveText("");
  });

  test("clears all slots when 'Xóa làm lại' button is clicked", async ({ page }) => {
    await page.goto("/games/sentences");

    const dropSlots = page.locator("button[aria-label^='Ô từ ']");
    const availableBankWords = page.locator("button[aria-label^='Từ ']:not([disabled])");

    // Place first word
    await availableBankWords.first().click();
    await expect(dropSlots.first()).not.toHaveText("");

    // Click clear button
    const clearBtn = page.getByRole("button", { name: /Xóa làm lại/i });
    await expect(clearBtn).toBeEnabled();
    await clearBtn.click();

    // Slot is now empty
    await expect(dropSlots.first()).toHaveText("");
  });

  test("shows feedback dialog when all words are placed and allows retry or next", async ({
    page,
  }) => {
    await page.goto("/games/sentences");

    const dropSlots = page.locator("button[aria-label^='Ô từ ']");
    const slotCount = await dropSlots.count();

    // Fill all slots by clicking currently active bank words one by one
    for (let i = 0; i < slotCount; i++) {
      const activeWord = page.locator("button[aria-label^='Từ ']:not([disabled])").first();
      await activeWord.click();
    }

    // Feedback dialog should appear
    const dialog = page.locator('[data-slot="dialog-content"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Should have either "Câu tiếp theo" or "Thử lại" button
    const actionBtn = dialog.getByRole("button", { name: /Câu tiếp theo|Thử lại/i });
    await expect(actionBtn).toBeVisible();

    await actionBtn.click();

    // Dialog should be dismissed
    await expect(dialog).not.toBeVisible();
  });

  test("allows switching sentence category filter", async ({ page }) => {
    await page.goto("/games/sentences");

    // Switch to Animals category
    const animalsBtn = page.getByRole("button", { name: /Động vật/i });
    await animalsBtn.click();

    await expect(page.getByText(/Câu 1 \/ \d+/i)).toBeVisible();
  });

  test("navigates back to homepage when clicking 'Về trang chủ'", async ({ page }) => {
    await page.goto("/games/sentences");

    const backBtn = page.getByRole("link", { name: /Về trang chủ/i });
    await backBtn.click();

    await expect(page).toHaveURL("/");
    await expect(page.locator("h1")).toContainText("GameHub Tiếng Anh");
  });
});
