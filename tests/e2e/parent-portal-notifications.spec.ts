// tests/e2e/parent-portal-notifications.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Parent Portal & Notification Hub E2E Flow', () => {
  test.describe('Admin Route Protection', () => {
    test('redirects unauthenticated user accessing /admin/parents to /login', async ({
      page,
    }) => {
      await page.goto('/admin/parents')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*parents/)
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    })
  })

  test.describe('Parent Public Landing & Authentication Form', () => {
    test('renders parent portal page with pedagogical cards and navigation', async ({
      page,
    }) => {
      await page.goto('/parent')

      // Main header and subtitle
      await expect(
        page.getByRole('heading', { name: /cổng thông tin phụ huynh/i })
      ).toBeVisible()
      await expect(
        page.getByText(/theo dõi sự tiến bộ mỗi ngày của con/i)
      ).toBeVisible()

      // Value props
      await expect(
        page.getByRole('heading', { name: /báo cáo học tập tuần/i })
      ).toBeVisible()
      await expect(
        page.getByRole('heading', { name: /thông báo từ lớp học/i })
      ).toBeVisible()
      await expect(
        page.getByRole('heading', { name: /bảng vàng chứng chỉ/i })
      ).toBeVisible()

      // Form inputs exist
      await expect(page.getByLabel(/mã lớp học/i)).toBeVisible()
      await expect(page.getByLabel(/tên của bé/i)).toBeVisible()
      await expect(page.getByLabel(/mã bảo mật phụ huynh/i)).toBeVisible()
    })

    test('validates required fields when submitting empty PIN credentials', async ({
      page,
    }) => {
      await page.goto('/parent')

      const submitBtn = page.getByRole('button', {
        name: /xem báo cáo học tập của con/i,
      })
      await submitBtn.click()

      // Error alert displayed
      await expect(
        page.getByText(/vui lòng nhập đầy đủ mã lớp, tên học sinh và mã pin/i)
      ).toBeVisible()
    })

    test('switches between PIN tab and direct Token link tab', async ({ page }) => {
      await page.goto('/parent')

      const tokenTab = page.getByRole('button', {
        name: /mã liên kết trực tiếp/i,
      })
      await tokenTab.click()

      await expect(
        page.getByLabel(/mã liên kết hoặc đường link/i)
      ).toBeVisible()

      const submitBtn = page.getByRole('button', {
        name: /xem báo cáo học tập của con/i,
      })
      await submitBtn.click()

      await expect(
        page.getByText(/vui lòng nhập mã liên kết hoặc dán toàn bộ đường link/i)
      ).toBeVisible()
    })
  })

  test.describe('Parent Magic Link Resolution & Error Handling', () => {
    test('renders friendly not-found card when visiting nonexistent or expired token', async ({
      page,
    }) => {
      await page.goto('/parent/INVALID-MAGIC-TOKEN-99999')

      await expect(
        page.getByRole('heading', { name: /không tìm thấy báo cáo học tập/i })
      ).toBeVisible()

      await expect(
        page.getByText(/liên kết phụ huynh không tồn tại hoặc đã bị thu hồi/i)
      ).toBeVisible()

      const returnLink = page.getByRole('link', {
        name: /nhập mã pin hoặc liên kết khác/i,
      })
      await expect(returnLink).toBeVisible()
      await expect(returnLink).toHaveAttribute('href', '/parent')
    })
  })

  test.describe('Strict Typography Compliance', () => {
    test('contains no sub-16px font size classes on the parent portal page', async ({
      page,
    }) => {
      await page.goto('/parent')

      const prohibitedRegex = /\b(text-xs|text-sm|text-\[1[0-4]px\]|text-\[[0-9]px\])\b/
      const classes = await page.evaluate(() => {
        const elements = document.querySelectorAll('*')
        const classNames: string[] = []
        elements.forEach((el) => {
          if (el.className && typeof el.className === 'string') {
            classNames.push(el.className)
          }
        })
        return classNames
      })

      const violations = classes.filter((cls) => prohibitedRegex.test(cls))
      expect(violations).toEqual([])
    })
  })
})
