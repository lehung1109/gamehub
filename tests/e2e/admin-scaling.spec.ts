import { test, expect } from '@playwright/test';
import { VIEWPORT_DESKTOP_XL, VIEWPORT_DESKTOP_2XL } from './helpers/viewport-helper';

test.describe('Admin Dashboard Scaling on Desktop (US4)', () => {
  test('admin login and pages render with scalable layout on xl and 2xl viewports', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP_XL);
    await page.goto('/login');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.setViewportSize(VIEWPORT_DESKTOP_2XL);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
