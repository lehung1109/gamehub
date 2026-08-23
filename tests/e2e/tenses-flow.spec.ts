import { test, expect } from "@playwright/test";

test.describe("Workplace English Tense Practice - User Story 1 Flow", () => {
  test("navigates from homepage banner to 12-Tenses Hub and opens Present Simple lesson", async ({
    page,
  }) => {
    // 1. Visit Homepage
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("GameHub Tiếng Anh");

    // 2. Check for Workplace Tenses banner and click it
    const tensesBannerLink = page.getByRole("link", {
      name: /luyện thì tiếng anh cho người đi làm|khám phá hub 12 thì/i,
    });
    await expect(tensesBannerLink).toBeVisible();
    await tensesBannerLink.click();

    // 3. Verify landing on /tenses
    await expect(page).toHaveURL(/\/tenses$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /bản đồ 12 thì tiếng anh/i })
    ).toBeVisible();

    // 4. Verify 3 timeframe groups are rendered
    await expect(
      page.getByRole("heading", { level: 2, name: /hiện tại|present/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /quá khứ|past/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /tương lai|future/i })
    ).toBeVisible();

    // 5. Verify Present Simple card is active and click it
    const presentSimpleCard = page.getByRole("link", {
      name: /thì hiện tại đơn/i,
    });
    await expect(presentSimpleCard).toBeVisible();
    await presentSimpleCard.click();

    // 6. Verify landing on /tenses/present-simple
    await expect(page).toHaveURL(/\/tenses\/present-simple$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /thì hiện tại đơn/i })
    ).toBeVisible();

    // 7. Verify Tabs and Breadcrumbs
    const rulesTab = page.getByRole("tab", { name: /quy tắc cốt lõi/i });
    const practiceTab = page.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await expect(rulesTab).toBeVisible();
    await expect(practiceTab).toBeVisible();

    // Switch tab
    await practiceTab.click();
    await expect(practiceTab).toHaveAttribute("aria-selected", "true");

    await rulesTab.click();
    await expect(rulesTab).toHaveAttribute("aria-selected", "true");

    // 8. Test Breadcrumb navigation back to Hub
    const hubBreadcrumb = page.getByRole("link", { name: /hub 12 thì|12 thì/i });
    await expect(hubBreadcrumb).toBeVisible();
    await hubBreadcrumb.click();
    await expect(page).toHaveURL(/\/tenses$/);
  });
});
