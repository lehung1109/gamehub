import { test, expect } from '@playwright/test';
import {
  VIEWPORT_LAPTOP_LG,
  VIEWPORT_DESKTOP_XL,
  VIEWPORT_DESKTOP_FHD,
  VIEWPORT_ULTRAWIDE,
  getComputedWidth,
} from './helpers/viewport-helper';

test.describe('Root Container Scaling across Viewports', () => {
  const containerSelector = '[data-testid="root-layout-container"]';

  test('scales container proportionally up to 1800px on large viewports', async ({ page }) => {
    // 1. At 1024px viewport width (lg)
    await page.setViewportSize(VIEWPORT_LAPTOP_LG);
    await page.goto('/');
    let width = await getComputedWidth(page, containerSelector);
    expect(width).toBeLessThanOrEqual(1024);

    // 2. At 1280px viewport width (xl)
    await page.setViewportSize(VIEWPORT_DESKTOP_XL);
    width = await getComputedWidth(page, containerSelector);
    expect(width).toBeLessThanOrEqual(1280);

    // 3. At 1440px viewport width
    await page.setViewportSize({ width: 1440, height: 900 });
    width = await getComputedWidth(page, containerSelector);
    expect(width).toBeLessThanOrEqual(1400);
    expect(width).toBeGreaterThanOrEqual(1280);

    // 4. At 1920px viewport width (2xl / FHD)
    await page.setViewportSize(VIEWPORT_DESKTOP_FHD);
    width = await getComputedWidth(page, containerSelector);
    expect(width).toBeLessThanOrEqual(1800);
    expect(width / 1920).toBeGreaterThanOrEqual(0.85);

    // 5. At 3440px viewport width (ultrawide cap)
    await page.setViewportSize(VIEWPORT_ULTRAWIDE);
    width = await getComputedWidth(page, containerSelector);
    expect(width).toBeLessThanOrEqual(1800);
  });
});
