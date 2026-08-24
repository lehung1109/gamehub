import { test, expect } from '@playwright/test';
import { VIEWPORT_ULTRAWIDE, getComputedWidth } from './helpers/viewport-helper';

test.describe('Ultra-wide Monitor Safety (3440px & 3840px cap)', () => {
  const containerSelector = '[data-testid="root-layout-container"]';

  test('caps content width at 1800px on ultrawide viewports without horizontal overflow', async ({ page }) => {
    // Test 3440px
    await page.setViewportSize(VIEWPORT_ULTRAWIDE);
    await page.goto('/');

    const width3440 = await getComputedWidth(page, containerSelector);
    expect(width3440).toBeLessThanOrEqual(1800);

    const hasHorizontalScrollbar3440 = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScrollbar3440).toBe(false);

    // Test 3840px (4K)
    await page.setViewportSize({ width: 3840, height: 2160 });
    const width3840 = await getComputedWidth(page, containerSelector);
    expect(width3840).toBeLessThanOrEqual(1800);

    const hasHorizontalScrollbar3840 = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScrollbar3840).toBe(false);
  });
});
