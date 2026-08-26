import { test, expect } from '@playwright/test';

test.describe('DevOps Challenge Stage', () => {
  test('should complete the DevOps challenge successfully', async ({ page }) => {
    // Navigate to Present Simple lesson
    await page.goto('/tenses/present-simple');

    // Go to Practice tab
    await page.getByRole('tab', { name: /Luyện Tập .* Chặng \(Practice\)/i }).click();

    // Verify the DevOps Challenge stage is visible
    const devopsStage = page.locator('text=Chặng 4: Thử Thách IT/DevOps');
    await expect(devopsStage).toBeVisible();

    // Enter the DevOps Challenge stage
    await page.locator('button', { hasText: 'Vào Chặng 4' }).click();

    // It should have mixed questions (Conjugation, Error Hunting, Sentence Building)
    // We expect 9 questions total. We'll verify we are in the challenge
    // by checking for the back button and progress indicator showing 1/9
    await expect(page.locator('text=Câu 1 / 9')).toBeVisible();

    // We will fail here if DevOpsChallengeStage.tsx is not implemented yet
  });
});
