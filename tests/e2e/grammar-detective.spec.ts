// tests/e2e/grammar-detective.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Grammar Detective Game E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'gamehub_student_session',
        JSON.stringify({ isAnonymous: true })
      );
    });
  });

  test('navigates from homepage to grammar detective game', async ({ page }) => {
    await page.goto('/');

    const gameLink = page.getByRole('link', { name: /Thám tử sửa lỗi/i });
    await expect(gameLink).toBeVisible();

    await gameLink.click();
    await expect(page).toHaveURL(/\/games\/grammar-detective/);
    await expect(page.locator('h1')).toContainText('Grammar Detective');
  });

  test('displays dossier browser and allows selecting a case', async ({ page }) => {
    await page.goto('/games/grammar-detective');

    // Verify dossier screen displays
    await expect(page.getByText('Hồ sơ lưu trữ các vụ án')).toBeVisible();
    await expect(page.getByText('Intern Detective').first()).toBeVisible();

    // Select the first case
    const caseBtn = page.getByRole('button', { name: /Thụ lý vụ án/i }).first();
    await expect(caseBtn).toBeVisible();
    await caseBtn.click();

    // Verify Detective Desk is loaded
    await expect(page.getByText('Bút dạ quang: ĐANG BẬT')).toBeVisible();
    await expect(page.getByText('Danh mục hồ sơ vụ án')).toBeVisible();
  });

  test('inspects erroneous token, opens deduction card, and solves an error', async ({
    page,
  }) => {
    await page.goto('/games/grammar-detective');

    // Launch first case (Urgent Release Deployment: error on "deploy")
    await page.getByRole('button', { name: /Thụ lý vụ án/i }).first().click();

    // Tap on the word "deploy"
    const deployToken = page.getByRole('button', { name: 'deploy', exact: true });
    await expect(deployToken).toBeVisible();
    await deployToken.click();

    // Verify Deduction Card opens
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Thẻ suy luận thám tử');
    await expect(dialog).toContainText('deployed');

    // Click the correct choice "deployed"
    const correctBtn = dialog.getByRole('button', { name: /deployed/i });
    await correctBtn.click();

    // Verify success feedback inside dialog
    await expect(dialog.getByText(/Chính xác! Quy tắc điều tra:/i)).toBeVisible();

    // Close the dialog
    await dialog.getByRole('button', { name: /Đóng bảng/i }).click({ force: true });
    await expect(dialog).not.toBeVisible();

    // Verify the document updated in-place to "deployed"
    await expect(page.getByRole('button', { name: 'deployed', exact: true })).toBeVisible();
  });

  test('launches Endless Audit mode and displays streak counter', async ({ page }) => {
    await page.goto('/games/grammar-detective');

    const endlessBtn = page.getByRole('button', { name: /Thử thách Vô tận/i });
    await expect(endlessBtn).toBeVisible();
    await endlessBtn.click();

    // Verify Endless mode header is active
    await expect(page.getByText('Chế độ vô tận (Endless Audit)')).toBeVisible();
    await expect(page.getByText(/Chuỗi: 0/i)).toBeVisible();

    // Return to dossier works
    await page.getByRole('button', { name: /Thoát vô tận/i }).click();
    await expect(page.getByText('Hồ sơ lưu trữ các vụ án')).toBeVisible();
  });
});
