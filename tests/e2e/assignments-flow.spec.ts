import { test, expect } from '@playwright/test';
import { mockClassStudent } from './helpers/auth-helper';

test.describe('Homework & Assignments Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockClassStudent(page, { classCode: 'DEMO123', studentName: 'Bé Linh' });
  });

  test('should open gamification modal and navigate to assignments tab', async ({ page }) => {
    await page.goto('/');

    const badge = page.locator('[data-testid="student-profile-badge"]');
    if (!(await badge.isVisible())) {
      await page.goto('/games/listening');
    }

    await expect(badge).toBeVisible();
    await badge.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Verify "Bài tập" tab is present in modal
    const assignmentsTab = page.getByRole('tab', { name: /bài tập/i });
    await expect(assignmentsTab).toBeVisible();

    // Click "Bài tập" tab
    await assignmentsTab.click();

    // Expect assignments section header or content to be visible
    await expect(dialog.getByText(/bài tập về nhà|chưa có bài tập nào/i).first()).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole('button', { name: /đóng/i });
    await closeBtn.click();
    await expect(dialog).not.toBeVisible();
  });
});
