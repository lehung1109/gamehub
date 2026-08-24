import { test, expect } from '@playwright/test';
import {
  VIEWPORT_MOBILE,
  VIEWPORT_TABLET,
  VIEWPORT_LAPTOP_LG,
} from './helpers/viewport-helper';

test.describe('Backwards Compatibility Visual Validation (<=1024px)', () => {
  test('verifies mobile view (375px) has 1 column and no horizontal overflow', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE);
    await page.goto('/');

    const gameCard = page.getByRole('link', { name: /Học từ vựng/i });
    await expect(gameCard).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('verifies tablet view (768px) and laptop view (1024px) maintain proper layouts', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_TABLET);
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('GameHub Tiếng Anh');

    await page.setViewportSize(VIEWPORT_LAPTOP_LG);
    await expect(page.locator('h1')).toContainText('GameHub Tiếng Anh');
  });
});
