// tests/e2e/student-reports-certificates.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Student Progress Reports & Printable Certificates E2E Flow', () => {
  test.describe('Admin Route Protection', () => {
    test('redirects unauthenticated user accessing student report to /login', async ({
      page,
    }) => {
      await page.goto('/admin/classes/class-test-123/reports/student-test-456')
      await expect(page).toHaveURL(
        /\/login\?redirect=.*admin.*classes.*reports.*student-test-456/
      )
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    })
  })

  test.describe('Public Certificate Verification', () => {
    test('displays not found state when accessing an invalid or nonexistent certificate code', async ({
      page,
    }) => {
      await page.goto('/verify/certificate/GH-NONEXISTENT')

      await expect(
        page.getByRole('heading', { name: /không tìm thấy chứng chỉ/i })
      ).toBeVisible()

      await expect(
        page.getByText(/mã xác thực.*GH-NONEXISTENT.*không tồn tại/i)
      ).toBeVisible()

      const returnLink = page.getByRole('link', {
        name: /trở về trang chủ gamehub/i,
      })
      await expect(returnLink).toBeVisible()
      await expect(returnLink).toHaveAttribute('href', '/')
    })
  })
})
