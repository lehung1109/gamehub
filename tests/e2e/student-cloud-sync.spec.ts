import { test, expect } from '@playwright/test';

test.describe('Cloud-Synced Student Gamification E2E Flow', () => {
  const classCode = 'TEST_CLOUD_SYNC';
  const studentName = 'Học Sinh Cloud';

  test('displays student profile with equipped cosmetics and active streak', async ({ page }) => {
    // Initialize session and preloaded gamification data
    await page.addInitScript(
      ({ code, name }) => {
        window.sessionStorage.setItem(
          'gamehub_student_session',
          JSON.stringify({ classCode: code, studentName: name })
        );
        window.localStorage.setItem(
          `gamehub_inventory_v1_${code.toUpperCase()}_${name.toLowerCase()}`,
          JSON.stringify({
            ownedItemIds: ['frame_gold', 'title_speed'],
            equippedFrameId: 'frame_gold',
            equippedTitleId: 'title_speed',
            spentStars: 50,
            bonusStars: 10,
          })
        );
        window.localStorage.setItem(
          `gamehub_streak_v1_${code.toUpperCase()}_${name.toLowerCase()}`,
          JSON.stringify({
            currentStreak: 5,
            longestStreak: 5,
            lastActiveDate: '2026-09-12',
            freezeCount: 1,
            totalActiveDays: 5,
            unlockedMilestones: [3],
          })
        );
      },
      { code: classCode, name: studentName }
    );

    // Navigate to homepage
    await page.goto('/');

    // Verify Student Badge renders equipped title and frame
    const badge = page.getByRole('button', { name: /Học Sinh Cloud/i });
    await expect(badge).toBeVisible();

    const titleBadge = page.getByTestId('equipped-title-badge').first();
    await expect(titleBadge).toBeVisible();
    await expect(titleBadge).toContainText('Thần Tốc Độ');

    const avatarFrame = page.getByTestId('student-avatar-frame');
    await expect(avatarFrame).toBeVisible();
    await expect(avatarFrame).toHaveClass(/ring-amber-400/);

    // Verify Daily Streak Flame Badge in header
    const streakBadge = page.getByTestId('daily-streak-badge');
    await expect(streakBadge).toBeVisible();
    await expect(streakBadge).toContainText('5');
  });

  test('anonymous session renders without errors or crash', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'gamehub_student_session',
        JSON.stringify({ isAnonymous: true })
      );
    });

    await page.goto('/');
    const mainHeading = page.getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();
  });
});
