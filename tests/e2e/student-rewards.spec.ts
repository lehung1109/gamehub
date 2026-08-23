import { test, expect } from '@playwright/test';

test.describe('Student Rewards - Phase 3 (Profile Badge)', () => {
  const classCode = 'TEST123';
  const studentName = 'Bé Bắp';

  test('US1: displays student profile badge with emoji, level, and stars in navbar', async ({
    page,
  }) => {
    // Pre-populate sessionStorage with a student session
    await page.addInitScript(
      (data) => {
        window.sessionStorage.setItem('gamehub_student_session', JSON.stringify(data));
      },
      {
        classCode: classCode,
        studentName: studentName,
      }
    );

    // Go to a specific game page
    await page.goto('/games/listening');

    // Wait for the gamification badge to appear
    const badge = page.getByTestId('student-profile-badge');
    await expect(badge).toBeVisible();

    // Verify Level badge emoji is displayed (e.g. 🐣 for Level 1)
    const badgeEmoji = page.getByTestId('level-badge-emoji');
    await expect(badgeEmoji).toBeVisible();
    await expect(badgeEmoji).toContainText('🐣');

    // Verify Level number and title
    await expect(badge).toContainText(/Lv \d+/i);
    await expect(badge).toContainText(/Tập sự|Khám phá|Chinh phục|Ngôi sao|Huyền thoại/i);

    // Verify Stars counter
    const starsCount = page.getByTestId('total-stars-count');
    await expect(starsCount).toBeVisible();
    await expect(starsCount).toContainText(/\d+/);
  });

  test('US1: does not display profile badge when playing anonymously', async ({ page }) => {
    // Pre-populate sessionStorage with anonymous session
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'gamehub_student_session',
        JSON.stringify({ isAnonymous: true })
      );
    });

    await page.goto('/games/listening');

    // Ensure student-profile-badge is not present
    const badge = page.getByTestId('student-profile-badge');
    await expect(badge).not.toBeVisible();
  });
});
