import { test, expect } from '@playwright/test';
import { mockAnonymousStudent } from './helpers/auth-helper';

test.describe('Pronunciation Lab E2E Flow (/games/pronunciation)', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page);
  });

  test('navigates from homepage to pronunciation lab and switches topics', async ({ page }) => {
    await page.goto('/');

    // Find pronunciation card on homepage
    const gameLink = page.getByRole('link', { name: /phòng luyện phát âm/i });
    await expect(gameLink).toBeVisible();
    await gameLink.click();

    await expect(page).toHaveURL('/games/pronunciation');
    await expect(page.getByRole('heading', { name: /phòng luyện phát âm/i })).toBeVisible();

    // Verify initial topic card
    await expect(page.getByText('ship')).toBeVisible();
    await expect(page.getByText('/ʃɪp/')).toBeVisible();

    // Switch topic to workplace words
    const topicBtn = page.getByRole('button', { name: /từ vựng công sở/i });
    await topicBtn.click();
    await expect(page.getByText('schedule')).toBeVisible();
    await expect(page.getByText('/ˈʃedʒuːl/')).toBeVisible();

    // Switch topic to standup phrases
    const standupBtn = page.getByRole('button', { name: /câu giao tiếp standup/i });
    await standupBtn.click();
    await expect(page.getByText(/can you hear me clearly\?/i)).toBeVisible();

    // Verify back button returns to homepage
    const backBtn = page.getByRole('link', { name: /quay lại/i });
    await backBtn.click();
    await expect(page).toHaveURL('/');
  });
});
