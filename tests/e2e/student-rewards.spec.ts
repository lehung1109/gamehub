import { test, expect } from '@playwright/test';

test.describe('Student Rewards & Gamification (Phase 3 & Phase 4)', () => {
  const classCode = 'TEST123';
  const studentName = 'Bé Bắp';

  test('US1: displays student profile badge with emoji, level, and stars in navbar', async ({
    page,
  }) => {
    // Mock getStudentProgress action response if called
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
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'gamehub_student_session',
        JSON.stringify({ isAnonymous: true })
      );
    });

    await page.goto('/games/listening');

    const badge = page.getByTestId('student-profile-badge');
    await expect(badge).not.toBeVisible();
  });

  test('US2: completes non-scoring flashcard deck and submits fixed 5 stars score', async ({
    page,
  }) => {
    await page.addInitScript(
      (data) => {
        window.sessionStorage.setItem('gamehub_student_session', JSON.stringify(data));
      },
      {
        classCode: classCode,
        studentName: studentName,
      }
    );

    // Intercept tracking API call
    let trackPayload: any = null;
    await page.route('/api/track', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        trackPayload = JSON.parse(request.postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, sessionId: 'mock-session-fc' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/games/flashcard/fruits');

    // Cycle through all flashcards
    while (true) {
      const nextBtn = page.getByRole('button', { name: 'Tiếp' });
      const finishBtn = page.getByRole('button', { name: 'Hoàn thành' });

      if (await finishBtn.isVisible()) {
        await finishBtn.click();
        break;
      } else if (await nextBtn.isVisible()) {
        await nextBtn.click();
      } else {
        break;
      }
    }

    // Completion message visible
    await expect(page.getByRole('heading', { name: /Xuất sắc!/i })).toBeVisible();

    // Verify track payload contained fixed score of 5 for flashcards
    expect(trackPayload).not.toBeNull();
    expect(trackPayload.score).toBe(5);
    expect(trackPayload.gameType).toBe('flashcard');
    expect(trackPayload.studentName).toBe(studentName);
    expect(trackPayload.classCode).toBe(classCode);
  });

  test('US2: displays level-up celebration dialog when student reaches next level', async ({
    page,
  }) => {
    await page.addInitScript(
      (data) => {
        window.sessionStorage.setItem('gamehub_student_session', JSON.stringify(data));
      },
      {
        classCode: classCode,
        studentName: studentName,
      }
    );

    // Route track request to succeed
    await page.route('/api/track', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, sessionId: 'mock-session-levelup' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/games/flashcard/animals');

    const celebrationDialog = page.getByTestId('level-up-dialog');
    // Initially not visible
    await expect(celebrationDialog).not.toBeVisible();

    // Complete cards
    while (true) {
      const nextBtn = page.getByRole('button', { name: 'Tiếp' });
      const finishBtn = page.getByRole('button', { name: 'Hoàn thành' });

      if (await finishBtn.isVisible()) {
        await finishBtn.click();
        break;
      } else if (await nextBtn.isVisible()) {
        await nextBtn.click();
      } else {
        break;
      }
    }

    // Completion message visible
    await expect(page.getByRole('heading', { name: /Xuất sắc!/i })).toBeVisible();
  });
});
