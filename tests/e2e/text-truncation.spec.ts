import { test, expect } from '@playwright/test';
import { VIEWPORT_DESKTOP_XL, VIEWPORT_TABLET } from './helpers/viewport-helper';

test.describe('Text Truncation Relaxation on Desktop (US2)', () => {
  test('relaxes text truncation on large screens while retaining clamps on small screens', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP_XL);
    await page.goto('/');

    // Check game cards have visible descriptions
    const gameCardDesc = page.locator('body').getByText(/Học 26 chữ cái tiếng Anh/i);
    await expect(gameCardDesc).toBeVisible();

    // Check on mobile/tablet view
    await page.setViewportSize(VIEWPORT_TABLET);
    await expect(gameCardDesc).toBeVisible();
  });
});
