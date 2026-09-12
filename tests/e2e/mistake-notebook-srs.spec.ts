import { test, expect } from '@playwright/test';

test.describe('Mistake Notebook & Leitner SRS E2E Flow', () => {
  const classCode = 'CLASS_SRS_101';
  const studentName = 'Bé Tuệ Nhi';

  test('student joins class, records mistakes, checks badge, reviews flashcards in arena, and completes session', async ({
    page,
  }) => {
    // 1. Initialize classroom student session and pre-seed a mistake card due for review
    await page.addInitScript(
      ({ code, name }) => {
        const session = {
          classCode: code,
          studentName: name,
          className: 'Lớp 1A',
          isAnonymous: false,
        };
        window.sessionStorage.setItem('gamehub_student_session', JSON.stringify(session));
        window.localStorage.setItem('gamehub_student_session', JSON.stringify(session));

        // Preload SRS mistake deck with 1 due card from a previous game mistake
        const storageKey = `gamehub_srs_deck_v1_${code.toUpperCase()}_${name.toLowerCase()}`;
        window.localStorage.setItem(
          storageKey,
          JSON.stringify([
            {
              id: 'vocab_apple',
              prompt: 'apple',
              correctAnswer: 'quả táo',
              selectedAnswer: 'quả cam',
              gameType: 'vocab',
              topic: 'fruits',
              box: 1,
              mistakeCount: 1,
              successCount: 0,
              isMastered: false,
              lastReviewedAt: null,
              nextReviewAt: '2020-01-01T00:00:00Z', // immediately due
            },
          ])
        );
      },
      { code: classCode, name: studentName }
    );

    // 2. Navigate to homepage
    await page.goto('/');

    // 3. Verify MistakeNotebookBadge shortcut is visible in header next to StudentProfileBadge
    const badge = page.getByTestId('mistake-notebook-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('1 từ cần ôn');

    // Verify pulsing red reminder dot is rendered
    const indicatorDot = page.getByTestId('mistake-indicator-dot');
    await expect(indicatorDot).toBeVisible();

    // 4. Click badge to open StudentGamificationModal directly on Notebook tab
    await badge.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(studentName);

    // Verify "Sổ tay" tab is automatically selected
    const notebookTab = page.getByTestId('tab-notebook');
    await expect(notebookTab).toBeVisible();
    await expect(notebookTab).toHaveAttribute('aria-selected', 'true');

    // 5. Verify the mistake card is listed in the notebook tab
    await expect(dialog.getByText('apple')).toBeVisible();
    await expect(dialog.getByText('quả táo')).toBeVisible();
    await expect(dialog.getByText('quả cam')).toBeVisible();
    await expect(dialog.getByText(/1 lần sai/i)).toBeVisible();
    await expect(dialog.getByText(/Cần ôn/i).first()).toBeVisible();

    // 6. Click "Luyện tập ngay" to start the Leitner SRS Practice Arena
    const practiceBtn = dialog.getByRole('button', { name: /Luyện tập ngay/i });
    await expect(practiceBtn).toBeVisible();
    await practiceBtn.click();

    // 7. Verify Arena loaded with flashcard front face
    await expect(dialog.getByText('Luyện tập Sổ tay')).toBeVisible();
    await expect(dialog.getByText(/Thẻ 1 \/ 1/i)).toBeVisible();
    await expect(dialog.getByText('apple', { exact: true })).toBeVisible();
    await expect(dialog.getByText(/Hãy nhớ lại nghĩa của từ trước khi lật thẻ/i)).toBeVisible();

    // 8. Flip the flashcard
    const flipButton = dialog.getByRole('button', { name: /Xem đáp án/i });
    await expect(flipButton).toBeVisible();
    await flipButton.click();

    // Verify back face is visible with correct answer and rating options
    await expect(dialog.getByText('quả táo')).toBeVisible();
    await expect(dialog.getByText(/Lần trước bạn chọn:/i)).toBeVisible();

    // 9. Self-rate the flashcard ("Được" or "Dễ")
    const rateGoodBtn = dialog.getByRole('button', { name: /Được|Vừa vặn/i });
    if (await rateGoodBtn.isVisible()) {
      await rateGoodBtn.click();
    } else {
      const rateHardBtn = dialog.getByRole('button', { name: /Khó/i });
      await rateHardBtn.click();
    }

    // 10. Verify completion screen
    await expect(dialog.getByText(/Hoàn thành lượt ôn tập!|Xuất sắc!/i)).toBeVisible();
    const finishBtn = dialog.getByRole('button', { name: /Hoàn tất/i });
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();

    // 11. Verify return to notebook tab
    await expect(dialog.getByText(/Ôn tập ngắt quãng/i)).toBeVisible();

    // 12. Close modal
    const closeBtn = dialog.getByRole('button', { name: /Đóng/i });
    await closeBtn.click();
    await expect(dialog).not.toBeVisible();

    // 13. Verify MistakeNotebookBadge is now hidden since 0 cards are due
    await expect(badge).not.toBeVisible();
  });

  test('displays MistakeNotebookBadge across /games layout when cards are due', async ({ page }) => {
    await page.addInitScript(
      ({ code, name }) => {
        const session = {
          classCode: code,
          studentName: name,
          className: 'Lớp 1A',
          isAnonymous: false,
        };
        window.sessionStorage.setItem('gamehub_student_session', JSON.stringify(session));
        window.localStorage.setItem('gamehub_student_session', JSON.stringify(session));

        const storageKey = `gamehub_srs_deck_v1_${code.toUpperCase()}_${name.toLowerCase()}`;
        window.localStorage.setItem(
          storageKey,
          JSON.stringify([
            {
              id: 'vocab_banana',
              prompt: 'banana',
              correctAnswer: 'quả chuối',
              box: 1,
              mistakeCount: 2,
              successCount: 0,
              isMastered: false,
              lastReviewedAt: null,
              nextReviewAt: '2020-01-01T00:00:00Z',
            },
            {
              id: 'vocab_cat',
              prompt: 'cat',
              correctAnswer: 'con mèo',
              box: 1,
              mistakeCount: 1,
              successCount: 0,
              isMastered: false,
              lastReviewedAt: null,
              nextReviewAt: '2020-01-01T00:00:00Z',
            },
          ])
        );
      },
      { code: classCode, name: studentName }
    );

    // Visit games page
    await page.goto('/games/flashcard');

    const badge = page.getByTestId('mistake-notebook-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('2 từ cần ôn');
  });

  test('does not display MistakeNotebookBadge for anonymous student', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'gamehub_student_session',
        JSON.stringify({ isAnonymous: true })
      );
    });

    await page.goto('/');

    const badge = page.getByTestId('mistake-notebook-badge');
    await expect(badge).not.toBeVisible();
  });
});
