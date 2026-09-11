import { test, expect } from "@playwright/test";
import { mockAnonymousStudent } from "./helpers/auth-helper";

test.describe("Reading Game Flow (/games/reading)", () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page);
  });

  test("redirects to test-module, displays passage and question, and evaluates answer", async ({
    page,
  }) => {
    // Navigate to /games/reading
    await page.goto("/games/reading");

    // Verify redirection to /games/reading/test-module
    await expect(page).toHaveURL(/\/games\/reading\/test-module/);

    // Verify passage content or reading container is visible
    await expect(page.getByRole("heading", { name: "A Day at the Park" })).toBeVisible();
    await expect(page.getByText(/Yesterday, Sarah went to the park/i)).toBeVisible();

    // Verify questions and option buttons are rendered
    await expect(page.getByText(/Question 1 of/i)).toBeVisible();
    await expect(page.getByText("What did Sarah bring in her basket?")).toBeVisible();

    const optionBtn = page.getByRole("button", { name: "Sandwiches and apples" });
    await expect(optionBtn).toBeVisible();

    // Click an option button, verify selection/feedback
    await optionBtn.click();

    // Verify feedback appears
    await expect(page.getByText(/✅ Correct!/i)).toBeVisible();
    await expect(
      page.getByText(/The text states: 'She brought a small basket with sandwiches and apples.'/i)
    ).toBeVisible();

    // Verify Next Question button is visible
    const nextBtn = page.getByRole("button", { name: /Next Question/i });
    await expect(nextBtn).toBeVisible();
  });

  test("navigates back to homepage when clicking 'Về trang chủ'", async ({ page }) => {
    await page.goto("/games/reading");
    await expect(page).toHaveURL(/\/games\/reading\/test-module/);

    const backBtn = page.getByRole("link", { name: /Về trang chủ/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page).toHaveURL("/");
  });
});
