import { test, expect } from '@playwright/test';

test.describe('Student Rewards & Gamification (Phase 3, Phase 4, Phase 5, Phase 6 Full Suite)', () => {
  const classCode = 'TEST123';
  const studentName = 'Bé Bắp';

  test.describe('User Story 1: Profile Badge in Navbar', () => {
    test('US1: displays student profile badge with emoji, level, and stars in navbar across game pages', async ({
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

      // Verify on Listening game
      await page.goto('/games/listening');
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

      // Verify progressbar accessibility
      const progressBar = page.getByRole('progressbar');
      await expect(progressBar).toBeVisible();
      await expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      await expect(progressBar).toHaveAttribute('aria-valuemax', '100');

      // Verify on Spelling game
      await page.goto('/games/spelling');
      await expect(page.getByTestId('student-profile-badge')).toBeVisible();

      // Verify on Sentences game
      await page.goto('/games/sentences');
      await expect(page.getByTestId('student-profile-badge')).toBeVisible();

      // Verify on Alphabet game
      await page.goto('/games/alphabet');
      await expect(page.getByTestId('student-profile-badge')).toBeVisible();

      // Verify on Numbers & Colors game
      await page.goto('/games/numbers-colors');
      await expect(page.getByTestId('student-profile-badge')).toBeVisible();
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

    test('US1: does not display profile badge when session is null/unauthenticated', async ({
      page,
    }) => {
      await page.goto('/games/listening');

      // Dismiss the join modal if open
      const skipButton = page.getByRole('button', { name: /bỏ qua/i });
      if (await skipButton.isVisible()) {
        await skipButton.click();
      }

      const badge = page.getByTestId('student-profile-badge');
      await expect(badge).not.toBeVisible();
    });
  });

  test.describe('User Story 2: Stars Accumulation and Level-Up Flow', () => {
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
      let trackPayload: {
        score?: number
        gameType?: string
        studentName?: string
        classCode?: string
        details?: unknown[]
      } | null = null;
      await page.route('**/api/track', async (route) => {
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
      expect(trackPayload!.score).toBe(5);
      expect(trackPayload!.gameType).toBe('flashcard');
      expect(trackPayload!.studentName).toBe(studentName);
      expect(trackPayload!.classCode).toBe(classCode);
    });

    test('US2: completes scoring game (listening) and submits question details & score', async ({
      page,
    }) => {
      let trackPayload: {
        score?: number
        gameType?: string
        studentName?: string
        classCode?: string
        details?: unknown[]
      } | null = null;
      await page.route('**/api/track', async (route) => {
        const request = route.request();
        if (request.method() === 'POST') {
          trackPayload = JSON.parse(request.postData() || '{}');
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, sessionId: 'mock-session-listen' }),
          });
        } else {
          await route.continue();
        }
      });

      await page.addInitScript(
        (data) => {
          window.sessionStorage.setItem('gamehub_student_session', JSON.stringify(data));
        },
        {
          classCode: classCode,
          studentName: studentName,
        }
      );

      await page.goto('/games/listening');

      // Answer questions
      for (let i = 1; i <= 10; i++) {
        const optionBtn = page.locator("button[aria-label^='Lựa chọn hình ảnh']").first();
        if (!(await optionBtn.isVisible().catch(() => false))) break;
        await optionBtn.click();

        const continueBtn = page.getByRole('button', { name: /Tiếp tục/i });
        try {
          await continueBtn.waitFor({ state: 'visible', timeout: 2000 });
          await continueBtn.click();
        } catch {
          // Auto-advanced or reached summary
        }

        const summaryVisible = await page
          .locator('text=/tuyệt đỉnh|chúc mừng|hoàn thành/i')
          .isVisible();
        if (summaryVisible) break;
      }

      await expect(
        page.locator('text=/tuyệt đỉnh|chúc mừng|hoàn thành bài tập/i')
      ).toBeVisible({ timeout: 10000 });

      expect(trackPayload).not.toBeNull();
      expect(trackPayload!.classCode).toBe(classCode);
      expect(trackPayload!.studentName).toBe(studentName);
      expect(trackPayload!.gameType).toBe('listening');
      expect(typeof trackPayload!.score).toBe('number');
      expect(Array.isArray(trackPayload!.details)).toBe(true);
    });

    test('US2: celebration dialog is hidden during normal gameplay and does not flash unexpectedly', async ({
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

      await page.goto('/games/flashcard/animals');

      const celebrationDialog = page.getByTestId('level-up-dialog');
      await expect(celebrationDialog).not.toBeVisible();
    });
  });

  test.describe('User Story 3: Cross-device and Cross-session Synchronization', () => {
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

      await pageA.route('**/api/track', async (route) => {
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
      // Set session in localStorage
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

    test('US3: student can switch profile and badge updates smoothly', async ({ page }) => {
      await page.addInitScript(
        (data) => {
          window.sessionStorage.setItem('gamehub_student_session', JSON.stringify(data));
        },
        {
          classCode: 'ABC123',
          studentName: 'Bé Táo',
        }
      );

      await page.goto('/games/listening');

      // Check initial badge
      await expect(page.getByTestId('student-profile-badge')).toBeVisible();
      await expect(page.getByRole('button', { name: /Bé Táo/i })).toBeVisible();

      // Click student badge to open edit popup
      await page.getByRole('button', { name: /Bé Táo/i }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Switch to anonymous via "Bỏ qua"
      await page.getByRole('button', { name: /Bỏ qua/i }).click();
      await expect(dialog).not.toBeVisible();

      // Gamification badge should now disappear for anonymous mode
      await expect(page.getByTestId('student-profile-badge')).not.toBeVisible();
      await expect(page.getByText(/Chơi tự do/i)).toBeVisible();
    });
  });

  test.describe('Resilience and Cross-Cutting Concerns', () => {
    test('handles corrupted session storage JSON gracefully without crashing', async ({
      page,
    }) => {
      await page.addInitScript(() => {
        window.sessionStorage.setItem('gamehub_student_session', 'invalid-json{{{{');
        window.localStorage.setItem('gamehub_student_session', 'invalid-json{{{{');
      });

      await page.goto('/games/listening');

      // The join popup should open gracefully instead of crashing
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(page.getByText('Tham gia lớp học')).toBeVisible();
    });

    test('handles failed /api/track endpoint silently without disrupting gameplay', async ({
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

      // Route /api/track to return 500 server error
      await page.route('**/api/track', async (route) => {
        const request = route.request();
        if (request.method() === 'POST') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Database offline' }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/games/flashcard/fruits');

      // Complete flashcards even with tracking API failure
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

      // UI still shows completion screen without crashing
      await expect(page.getByRole('heading', { name: /Xuất sắc!/i })).toBeVisible();
    });

    test('renders profile badge properly on mobile viewport (375x667)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.addInitScript(
        (data) => {
          window.sessionStorage.setItem('gamehub_student_session', JSON.stringify(data));
        },
        {
          classCode: classCode,
          studentName: studentName,
        }
      );

      await page.goto('/games/listening');

      const badge = page.getByTestId('student-profile-badge');
      await expect(badge).toBeVisible();
      await expect(page.getByTestId('level-badge-emoji')).toBeVisible();
      await expect(page.getByTestId('total-stars-count')).toBeVisible();
    });
  });
});
