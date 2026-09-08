import { test, expect } from "@playwright/test";

test.describe("Crossword Master E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "gamehub_student_session",
        JSON.stringify({
          classCode: "TEST99",
          studentName: "Alex",
          studentId: "student-alex",
        })
      );
    });
  });

  test("loads crossword page, renders grid and clue panel, and accepts typing", async ({ page }) => {
    await page.goto("/games/crossword");
    await expect(page.getByText(/Hàng ngang/i)).toBeVisible();
    await expect(page.getByText(/Hàng dọc/i)).toBeVisible();

    // Locate currently selected cell and verify it receives the typed letter
    const selectedCell = page.locator('[aria-selected="true"]');
    await expect(selectedCell).toBeVisible();

    // Type a letter on keyboard
    await page.keyboard.press("T");
    await expect(selectedCell).toContainText("T");
  });
});
