import { test, expect } from "@playwright/test";

test.describe("Spelling Game E2E Flow (/games/spelling)", () => {
  test("loads Spelling Game page, verifies header, navigation, and word prompt controls", async ({
    page,
  }) => {
    await page.goto("/games/spelling");

    // Check heading
    await expect(page.locator("h1")).toContainText("Đánh vần");

    // Check Back button
    const backBtn = page.getByRole("link", { name: /Về trang chủ/i });
    await expect(backBtn).toBeVisible();

    // Check Speaker button
    const speakBtn = page.getByRole("button", { name: /Nghe phát âm/i });
    await expect(speakBtn).toBeVisible();

    // Check topic filter pills
    await expect(page.getByRole("button", { name: /Tất cả/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Động vật/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Trái cây/i })).toBeVisible();

    // Check Word counter
    await expect(page.getByText(/Từ 1 \/ \d+/i)).toBeVisible();

    // Check Drop slots region and Letter bank region
    const dropSlots = page.locator("button[aria-label^='Ô chữ cái']");
    const slotCount = await dropSlots.count();
    expect(slotCount).toBeGreaterThanOrEqual(3);
    expect(slotCount).toBeLessThanOrEqual(5);

    const bankLetters = page.locator("button[aria-label^='Chữ cái ']");
    const bankCount = await bankLetters.count();
    expect(bankCount).toBeGreaterThanOrEqual(slotCount + 2);
  });

  test("allows placing letters into slots via tap-to-place and removing them by clicking slot", async ({
    page,
  }) => {
    await page.goto("/games/spelling");

    const dropSlots = page.locator("button[aria-label^='Ô chữ cái']");
    const firstSlot = dropSlots.first();
    await expect(firstSlot).toBeVisible();

    const availableBankLetters = page.locator("button[aria-label^='Chữ cái ']:not([disabled])");
    const firstBankLetter = availableBankLetters.first();
    await expect(firstBankLetter).toBeVisible();

    const letterText = (await firstBankLetter.innerText()).trim();

    // Click bank letter to place in slot
    await firstBankLetter.click();

    // First slot should now have the letter
    await expect(firstSlot).toHaveText(letterText);

    // Click the slot to remove the letter back to bank
    await firstSlot.click();
    await expect(firstSlot).toHaveText("");
  });

  test("clears all slots when 'Xóa làm lại' button is clicked", async ({ page }) => {
    await page.goto("/games/spelling");

    const dropSlots = page.locator("button[aria-label^='Ô chữ cái']");
    const availableBankLetters = page.locator("button[aria-label^='Chữ cái ']:not([disabled])");

    // Place first letter
    await availableBankLetters.first().click();
    await expect(dropSlots.first()).not.toHaveText("");

    // Click clear button
    const clearBtn = page.getByRole("button", { name: /Xóa làm lại/i });
    await expect(clearBtn).toBeEnabled();
    await clearBtn.click();

    // Slot is now empty
    await expect(dropSlots.first()).toHaveText("");
  });

  test("shows feedback dialog when all slots are filled and allows retry or next", async ({
    page,
  }) => {
    await page.goto("/games/spelling");

    const dropSlots = page.locator("button[aria-label^='Ô chữ cái']");
    const slotCount = await dropSlots.count();

    // Fill all slots by clicking currently active bank letters one by one
    for (let i = 0; i < slotCount; i++) {
      const activeLetter = page.locator("button[aria-label^='Chữ cái ']:not([disabled])").first();
      await activeLetter.click();
    }

    // Feedback dialog should appear
    const dialog = page.locator('[data-slot="dialog-content"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Should have either "Từ tiếp theo" or "Thử lại" button
    const actionBtn = dialog.getByRole("button", { name: /Từ tiếp theo|Thử lại/i });
    await expect(actionBtn).toBeVisible();

    await actionBtn.click();

    // Dialog should be dismissed
    await expect(dialog).not.toBeVisible();
  });

  test("allows switching topic filter", async ({ page }) => {
    await page.goto("/games/spelling");

    // Switch to Fruits topic
    const fruitsBtn = page.getByRole("button", { name: /Trái cây/i });
    await fruitsBtn.click();

    await expect(page.getByText(/Từ 1 \/ \d+/i)).toBeVisible();
  });

  test("navigates back to homepage when clicking 'Về trang chủ'", async ({ page }) => {
    await page.goto("/games/spelling");

    const backBtn = page.getByRole("link", { name: /Về trang chủ/i });
    await backBtn.click();

    await expect(page).toHaveURL("/");
    await expect(page.locator("h1")).toContainText("GameHub Tiếng Anh");
  });
});
