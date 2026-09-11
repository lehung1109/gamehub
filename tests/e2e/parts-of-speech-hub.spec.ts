import { test, expect } from '@playwright/test';
import { mockAnonymousStudent } from './helpers/auth-helper';

test.describe('Parts of Speech Hub Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page);
  });

  test('should display hub page and list all 5 active lessons', async ({ page }) => {
    // Navigate to the hub
    await page.goto('/parts-of-speech');

    // Verify header exists
    await expect(page.locator('h1').filter({ hasText: 'Parts of Speech Practice' })).toBeVisible();

    // Check that all 5 modules are rendered as active links
    const lessons = [
      { name: /danh từ/i, en: 'Noun', href: '/parts-of-speech/noun' },
      { name: /động từ/i, en: 'Verb', href: '/parts-of-speech/verb' },
      { name: /tính từ/i, en: 'Adjective', href: '/parts-of-speech/adjective' },
      { name: /trạng từ/i, en: 'Adverb', href: '/parts-of-speech/adverb' },
      { name: /tổng hợp/i, en: 'Mixed', href: '/parts-of-speech/mixed' },
    ];

    for (const lesson of lessons) {
      const link = page.getByRole('link', { name: lesson.name });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', lesson.href);
      await expect(page.getByText(lesson.en, { exact: true })).toBeVisible();
    }

    // Verify none of them has "Coming Soon"
    await expect(page.getByText('Coming Soon')).toHaveCount(0);
  });

  test('should navigate to each lesson page and display its content', async ({ page }) => {
    await page.goto('/parts-of-speech');

    // Click on "Động từ" link
    const verbLink = page.getByRole('link', { name: /động từ/i });
    await expect(verbLink).toBeVisible();
    await verbLink.click();

    // Verify URL is /parts-of-speech/verb and heading contains "Động từ (Verb)"
    await page.waitForURL('/parts-of-speech/verb');
    await expect(page).toHaveURL(/\/parts-of-speech\/verb$/);
    await expect(page.getByText(/Động từ \(Verb\)/i)).toBeVisible();

    // Click "Về danh sách" and verify back on /parts-of-speech
    const backButton = page.getByRole('button', { name: /về danh sách/i });
    await expect(backButton).toBeVisible();
    await backButton.click();
    await page.waitForURL('/parts-of-speech');
    await expect(page).toHaveURL(/\/parts-of-speech$/);

    // Click on "Tổng hợp" link
    const mixedLink = page.getByRole('link', { name: /tổng hợp/i });
    await expect(mixedLink).toBeVisible();
    await mixedLink.click();

    // Verify URL is /parts-of-speech/mixed and heading contains "Tổng hợp (Mixed)"
    await page.waitForURL('/parts-of-speech/mixed');
    await expect(page).toHaveURL(/\/parts-of-speech\/mixed$/);
    await expect(page.getByText(/Tổng hợp \(Mixed\)/i)).toBeVisible();
  });

  test('should switch tabs and start a practice stage', async ({ page }) => {
    // Navigate to /parts-of-speech/adjective
    await page.goto('/parts-of-speech/adjective');

    // Verify Quick Rules tab is visible by default
    const rulesTab = page.getByRole('button', { name: /quy tắc cốt lõi/i });
    await expect(rulesTab).toBeVisible();
    await expect(page.getByText(/Đuôi Tính Từ Phổ Biến/i)).toBeVisible();

    // Click "Luyện Tập Chặng" tab
    const practiceTab = page.getByRole('button', { name: /luyện tập chặng/i });
    await expect(practiceTab).toBeVisible();
    await practiceTab.click();

    // Verify the 3 stages are visible (Word Family, Fill in Blank, Error Hunting)
    await expect(page.getByText(/Chặng 1: Nhận diện họ từ \(Word Family\)/i)).toBeVisible();
    await expect(page.getByText(/Chặng 2: Điền từ vào chỗ trống/i)).toBeVisible();
    await expect(page.getByText(/Chặng 3: Săn lỗi sai/i)).toBeVisible();

    // Click "Bắt đầu chặng" on Stage 1 (Word Family)
    const startButtons = page.getByRole('button', { name: /bắt đầu chặng/i });
    await startButtons.first().click();

    // Verify Word Family question/challenge is displayed
    await expect(page.getByText('Ghép tiền tố/hậu tố phù hợp')).toBeVisible();
    await expect(page.getByRole('button', { name: /kiểm tra/i })).toBeVisible();
  });
});
