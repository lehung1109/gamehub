// tests/e2e/live-classroom-arena.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Live Classroom Arena E2E Flow', () => {
  test.describe('Admin Route Protection', () => {
    test('redirects unauthenticated user accessing /admin/arena/new to /login', async ({
      page,
    }) => {
      await page.goto('/admin/arena/new')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*arena.*new/)
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    })

    test('redirects unauthenticated user accessing /admin/arena/fake-id to /login', async ({
      page,
    }) => {
      await page.goto('/admin/arena/fake-id')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*arena.*fake-id/)
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    })
  })

  test.describe('Student Join Experience', () => {
    test('renders arena entry screen with PIN form and avatar picker', async ({ page }) => {
      await page.goto('/arena')

      await expect(
        page.getByRole('heading', { name: /tham gia đấu trường trực tiếp/i })
      ).toBeVisible()

      const pinInput = page.getByPlaceholder('123456')
      await expect(pinInput).toBeVisible()

      const nameInput = page.getByPlaceholder(/nhập tên hoặc biệt danh/i)
      await expect(nameInput).toBeVisible()

      const submitBtn = page.getByRole('button', { name: /vào phòng đấu/i })
      await expect(submitBtn).toBeVisible()
    })

    test('shows validation error when entering incomplete PIN', async ({ page }) => {
      await page.goto('/arena')

      const pinInput = page.getByPlaceholder('123456')
      await pinInput.fill('12')

      const submitBtn = page.getByRole('button', { name: /vào phòng đấu/i })
      await submitBtn.click()

      await expect(
        page.getByText(/mã PIN phải gồm đúng 6 chữ số/i)
      ).toBeVisible()
    })

    test('shows not found error when entering non-existent arena PIN', async ({ page }) => {
      await page.goto('/arena/999999')

      await expect(
        page.getByText(/không tìm thấy phòng đấu hoặc mã PIN không hợp lệ/i)
      ).toBeVisible()

      const returnLink = page.getByRole('link', { name: /nhập mã pin khác/i })
      await expect(returnLink).toBeVisible()
      await expect(returnLink).toHaveAttribute('href', '/arena')
    })
  })
})
