import { test, expect } from '@playwright/test';
import { mockClassStudent } from './helpers/auth-helper';

test.describe('Class Leaderboard & Gamification E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockClassStudent(page, { classCode: 'DEMO123', studentName: 'Bé Linh' });
  });

  test('should display interactive student profile badge on homepage and open gamification modal on click', async ({
    page,
  }) => {
    await page.goto('/');

    const badge = page.locator('[data-testid="student-profile-badge"]');
    await expect(badge).toBeVisible();
    await badge.click();

    // Expect dialog or heading containing "Bảng Vàng & Thành Tích" to be visible
    const modalHeading = page.getByRole('heading', { name: /Bảng Vàng & Thành Tích/i });
    await expect(modalHeading).toBeVisible();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Verify student name "Bé Linh" and class "DEMO123" are displayed in modal header
    await expect(dialog).toContainText('Bé Linh');
    await expect(dialog).toContainText('DEMO123');
  });

  test('should navigate through Leaderboard, Badges, and Levels tabs', async ({ page }) => {
    await page.goto('/');

    const badge = page.locator('[data-testid="student-profile-badge"]');
    await expect(badge).toBeVisible();
    await badge.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Verify "Bảng xếp hạng" tab is rendered
    const leaderboardTab = page.getByRole('tab', { name: /Bảng xếp hạng/i });
    await expect(leaderboardTab).toBeVisible();

    // Click "Huy hiệu" tab: verify text containing "Huy hiệu" and badges catalog is visible (e.g. "Bước đầu tiên", "Nhà thám hiểm")
    const badgesTab = page.getByRole('tab', { name: /Huy hiệu/i });
    await badgesTab.click();
    await expect(dialog.getByText(/Huy hiệu/i).first()).toBeVisible();
    await expect(dialog.getByText('Bước đầu tiên')).toBeVisible();
    await expect(dialog.getByText(/Nhà thám hiểm/i)).toBeVisible();

    // Click "Cấp độ" tab: verify text containing "Lộ trình cấp độ" and levels ("Tập sự", "Khám phá", "Chinh phục", "Ngôi sao", "Huyền thoại") are visible
    const levelsTab = page.getByRole('tab', { name: /Cấp độ/i });
    await levelsTab.click();
    await expect(dialog.getByText(/(?:Lộ|Hành) trình cấp độ/i)).toBeVisible();
    await expect(dialog.getByText(/Tập sự/i).first()).toBeVisible();
    await expect(dialog.getByText(/Khám phá/i).first()).toBeVisible();
    await expect(dialog.getByText(/Chinh phục/i).first()).toBeVisible();
    await expect(dialog.getByText(/Ngôi sao/i).first()).toBeVisible();
    await expect(dialog.getByText(/Huyền thoại/i).first()).toBeVisible();

    // Click close button (label / aria-label "Đóng"), verify modal is dismissed
    const closeBtn = page.getByRole('button', { name: /Đóng/i });
    await closeBtn.click();
    await expect(dialog).not.toBeVisible();
  });
});
