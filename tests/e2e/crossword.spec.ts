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

    // Locate currently selected cell before cursor advances
    const initialCell = page.locator('[role="region"][aria-label="Crossword grid"] [aria-pressed="true"]');
    await expect(initialCell).toBeVisible();
    const cellTestId = await initialCell.getAttribute("data-testid");
    expect(cellTestId).toBeTruthy();

    // Type a letter on keyboard
    await page.keyboard.press("T");
    await expect(page.getByTestId(cellTestId!)).toContainText("T");

    // Arrow navigation
    await page.keyboard.press("ArrowRight");

    // Virtual keyboard interaction
    const keyA = page.getByRole("button", { name: "A", exact: true });
    await expect(keyA).toBeVisible();
    await keyA.click();
  });
});
