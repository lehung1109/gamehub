import { test, expect } from '@playwright/test';

test.describe('Parts of Speech Hub Navigation', () => {
  test('should display hub page and list active and coming soon lessons', async ({ page }) => {
    // Navigate to the hub
    await page.goto('/parts-of-speech');

    // Verify header exists
    await expect(page.locator('h1').filter({ hasText: 'Parts of Speech Practice' })).toBeVisible();

    // Verify active lesson "Danh từ" (Noun) is visible
    const nounCard = page.locator('div').filter({ hasText: 'Danh từ' }).first();
    await expect(nounCard).toBeVisible();
    
    // Check if coming soon lesson "Verb" is visible but not clickable
    const verbCard = page.locator('div').filter({ hasText: 'Động từ' }).first();
    await expect(verbCard).toBeVisible();
    await expect(verbCard).toContainText('Coming Soon');
  });

  test('should navigate to active lesson page when clicked', async ({ page }) => {
    await page.goto('/parts-of-speech');

    // Click on the Noun card
    const nounCard = page.getByRole('link', { name: /danh từ/i });
    
    // We expect clicking to navigate to the lesson page
    await nounCard.click();
    
    // Wait for URL to change
    await page.waitForURL('/parts-of-speech/noun');
    
    // Verify we are on the noun page
    await expect(page).toHaveURL(/\/parts-of-speech\/noun/);
    
    // Back to hub
    await page.goto('/parts-of-speech');
  });
});
