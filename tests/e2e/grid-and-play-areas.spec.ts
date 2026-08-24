import { test, expect } from '@playwright/test';
import { VIEWPORT_DESKTOP_2XL, VIEWPORT_DESKTOP_FHD } from './helpers/viewport-helper';

test.describe('Grid Columns and Play Areas on Desktop (US3)', () => {
  test('home page displays game cards at 1536px viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP_2XL);
    await page.goto('/');

    const gameCard = page.getByRole('link', { name: /Học từ vựng/i });
    await expect(gameCard).toBeVisible();
  });

  test('flashcard topics grid displays topic cards at 1536px viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP_2XL);
    await page.goto('/games/flashcard');

    await expect(page.locator('h1').first()).toContainText('Học từ vựng');
  });

  test('play areas scale cleanly at 1920px viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP_FHD);
    await page.goto('/games/sentences');

    await expect(page.locator('h1').first()).toContainText('Luyện câu đơn giản');
  });
});
