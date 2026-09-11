import { test, expect } from "@playwright/test";
import { mockAnonymousStudent } from "./helpers/auth-helper";

test.describe("Roleplay Game Flow (/games/roleplay)", () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page);
  });

  test("displays intro screen, starts conversation, shows dialogue bubbles, and handles user response", async ({
    page,
  }) => {
    // Navigate to /games/roleplay
    await page.goto("/games/roleplay");

    // Verify scenario title and "Start Conversation" button appear
    await expect(page.getByRole("heading", { name: "Ordering Food at a Restaurant" })).toBeVisible();
    await expect(page.getByText("Gọi món ở nhà hàng")).toBeVisible();
    const startBtn = page.getByRole("button", { name: /Start Conversation/i });
    await expect(startBtn).toBeVisible();

    // Click "Start Conversation"
    await startBtn.click();

    // Verify chat bubble and response choices appear
    await expect(page.getByText("Hello, are you ready to order?")).toBeVisible();
    await expect(page.getByText("Choose your response:")).toBeVisible();

    const firstChoice = page.getByRole("button", { name: "Yes, I would like a burger." });
    await expect(firstChoice).toBeVisible();
    await expect(page.getByRole("button", { name: "I am fine." })).toBeVisible();

    // Click one of the response choices
    await firstChoice.click();

    // Verify learner chat bubble appears and score updates
    await expect(page.getByText("Yes, I would like a burger.")).toBeVisible();
    await expect(page.getByText("Score: 1")).toBeVisible();

    // Verify conversation advances to next turn
    await expect(page.getByText("Great choice. Would you like fries with that?")).toBeVisible();
  });

  test("allows exiting back to homepage from intro screen", async ({ page }) => {
    await page.goto("/games/roleplay");

    const backBtn = page.getByRole("link", { name: /Về trang chủ/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page).toHaveURL("/");
  });
});
