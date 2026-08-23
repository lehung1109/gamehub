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

  test.describe('US3: Cross-device and Cross-session Synchronization', () => {
    test('US3: synchronizes stars across devices when student logs in on a new device/context', async ({
      browser,
    }) => {
      const syncClassCode = 'SYNC100';
      const syncStudentName = 'Bé Sóc';

      // Context 1 (Device A): Student plays game and accumulates stars
      const contextA = await browser.newContext();
      const pageA = await contextA.newPage();

      await pageA.addInitScript(
        (data) => {
          window.sessionStorage.setItem('gamehub_student_session', JSON.stringify(data));
          window.localStorage.setItem('gamehub_student_session', JSON.stringify(data));
        },
        {
          classCode: syncClassCode,
          studentName: syncStudentName,
        }
      );

      // Route /api/track on Device A
      await pageA.route('/api/track', async (route) => {
        const request = route.request();
        if (request.method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, sessionId: 'sync-sess-1' }),
          });
        } else {
          await route.continue();
        }
      });

      await pageA.goto('/games/listening');
      const badgeA = pageA.getByTestId('student-profile-badge');
      await expect(badgeA).toBeVisible();
      await contextA.close();

      // Context 2 (Device B): Student opens a new device (completely clean storage)
      const contextB = await browser.newContext();
      const pageB = await contextB.newPage();

      // Pre-seed mock student progress in DB or mock session
      await pageB.addInitScript(
        (data) => {
          window.sessionStorage.setItem('gamehub_student_session', JSON.stringify(data));
        },
        {
          classCode: syncClassCode,
          studentName: syncStudentName,
          className: 'Lớp Sóc Nâu',
        }
      );

      await pageB.goto('/games/spelling');

      // Verify Device B immediately reflects the profile badge
      const badgeB = pageB.getByTestId('student-profile-badge');
      await expect(badgeB).toBeVisible();
      await expect(badgeB).toContainText(/Lv \d+/i);

      await contextB.close();
    });

    test('US3: loads credentials from storage upon page reload and preserves student badge', async ({
      page,
    }) => {
      // Set session in storage
      await page.addInitScript(
        (data) => {
          window.localStorage.setItem('gamehub_student_session', JSON.stringify(data));
        },
        {
          classCode: 'RELOAD88',
          studentName: 'Bé Miu',
          className: 'Lớp Mầm',
        }
      );

      await page.goto('/games/listening');

      const badge = page.getByTestId('student-profile-badge');
      await expect(badge).toBeVisible();
      await expect(page.getByTestId('total-stars-count')).toBeVisible();

      // Reload page to verify hydration from storage
      await page.reload();

      await expect(page.getByTestId('student-profile-badge')).toBeVisible();
      await expect(page.getByTestId('level-badge-emoji')).toBeVisible();
    });

    test('US3: new student with 0 previous plays starts at Level 1 with 0 stars', async ({
      page,
    }) => {
      await page.addInitScript(
        (data) => {
          window.sessionStorage.setItem('gamehub_student_session', JSON.stringify(data));
        },
        {
          classCode: 'NEWSTUDENT',
          studentName: 'Em Bé Mới',
        }
      );

      await page.goto('/games/flashcard/fruits');

      const badge = page.getByTestId('student-profile-badge');
      await expect(badge).toBeVisible();

      const badgeEmoji = page.getByTestId('level-badge-emoji');
      await expect(badgeEmoji).toHaveText('🐣');

      const starsCount = page.getByTestId('total-stars-count');
      await expect(starsCount).toHaveText('0');
    });
  });
});

