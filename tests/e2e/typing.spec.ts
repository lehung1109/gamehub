import { test, expect } from "@playwright/test";
import { mockAnonymousStudent } from "./helpers/auth-helper";

test.describe("Typing Game Flow (/games/typing)", () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page);
  });

  test("loads typing game, accepts user keystrokes, submits answer, and shows feedback", async ({
    page,
  }) => {
    // Navigate to /games/typing
    await page.goto("/games/typing");

    // Verify question progress and score
    await expect(page.getByText(/Question 1 of/i)).toBeVisible();
    await expect(page.getByText(/Score: \d+/i)).toBeVisible();

    // Verify typing sentence container and input field appear
    const typingInput = page.locator('[data-testid="typing-input"]');
    await expect(typingInput).toBeVisible();
    await expect(typingInput).toBeEnabled();

    // Verify "Kiểm tra" button is initially disabled when input is empty
    const submitBtn = page.getByRole("button", { name: /Kiểm tra/i });
    await expect(submitBtn).toBeDisabled();

    // Type into the input box
    await typingInput.fill("works");
    await expect(typingInput).toHaveValue("works");
    await expect(submitBtn).toBeEnabled();

    // Click "Kiểm tra" button
    await submitBtn.click();

    // Verify correctness feedback or "Correct!" / "Incorrect" feedback appears
    await expect(page.getByText(/Correct!|Incorrect/i)).toBeVisible();

    // Verify input becomes disabled after submission and Next button is displayed
    await expect(typingInput).toBeDisabled();
    const nextBtn = page.getByRole("button", { name: /Next/i });
    await expect(nextBtn).toBeVisible();

    // Click Next and verify transition to next question
    await nextBtn.click();
    await expect(page.getByText(/Question 2 of/i)).toBeVisible();
  });

  test("navigates back to homepage using back button", async ({ page }) => {
    await page.goto("/games/typing");

    const backBtn = page.getByRole("link", { name: /Về trang chủ/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page).toHaveURL("/");
  });
});
