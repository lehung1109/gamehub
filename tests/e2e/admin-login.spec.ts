// tests/e2e/admin-login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin Login & Account Management (User Story 1)', () => {
  test('redirects unauthenticated user accessing /admin/dashboard to /login', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/login\?redirect=.*admin.*dashboard/)
    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
  })

  test('displays login form with email and password inputs and back to home link', async ({
    page,
  }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mật khẩu/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible()

    const homeLink = page.getByRole('link', { name: /trang chủ/i })
    await expect(homeLink).toBeVisible()
  })

  test('shows validation error when submitting empty fields', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /đăng nhập/i }).click()

    // Form validation or error message should be displayed
    const errorMsg = page.getByText(/bắt buộc/i)
    await expect(errorMsg).toBeVisible()
  })
})
