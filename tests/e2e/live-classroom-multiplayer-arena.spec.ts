// tests/e2e/live-classroom-multiplayer-arena.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Phase 13: Live Classroom Multiplayer Arena E2E', () => {
  test.describe('Arena Student Entry & Typography Audit', () => {
    test('renders arena entry screen with PIN form, avatar picker, and kid-friendly typography', async ({
      page,
    }) => {
      await page.goto('/arena')

      // Heading and form elements
      await expect(
        page.getByRole('heading', { name: /tham gia đấu trường trực tiếp/i })
      ).toBeVisible()

      const pinInput = page.getByPlaceholder('123456')
      await expect(pinInput).toBeVisible()

      const nameInput = page.getByPlaceholder(/nhập tên hoặc biệt danh/i)
      await expect(nameInput).toBeVisible()

      const submitBtn = page.getByRole('button', { name: /vào phòng đấu/i })
      await expect(submitBtn).toBeVisible()

      // Kid-friendly typography audit: ensure zero text-xs or text-sm classes
      const pageHtml = await page.content()
      expect(pageHtml).not.toContain('text-xs')
      expect(pageHtml).not.toContain('text-sm')
      expect(pageHtml).not.toContain('text-[10px]')
      expect(pageHtml).not.toContain('text-[12px]')
      expect(pageHtml).not.toContain('text-[14px]')
    })

    test('validates 6-digit PIN requirement with clear feedback', async ({ page }) => {
      await page.goto('/arena')

      const pinInput = page.getByPlaceholder('123456')
      await pinInput.fill('123')

      const nameInput = page.getByPlaceholder(/nhập tên hoặc biệt danh/i)
      await nameInput.fill('Học sinh thử nghiệm')

      const submitBtn = page.getByRole('button', { name: /vào phòng đấu/i })
      await submitBtn.click()

      await expect(
        page.getByText(/mã PIN phải gồm đúng 6 chữ số/i)
      ).toBeVisible()
    })

    test('renders not-found state with strict typography when room PIN does not exist', async ({
      page,
    }) => {
      await page.goto('/arena/777777')

      await expect(
        page.getByRole('heading', { name: /không tìm thấy phòng đấu hoặc mã PIN không hợp lệ/i })
      ).toBeVisible()

      const returnLink = page.getByRole('link', { name: /nhập mã pin khác/i })
      await expect(returnLink).toBeVisible()
      await expect(returnLink).toHaveAttribute('href', '/arena')

      // Kid-friendly typography audit on not-found page
      const pageHtml = await page.content()
      expect(pageHtml).not.toContain('text-xs')
      expect(pageHtml).not.toContain('text-sm')
    })
  })

  test.describe('Teacher Arena Host Security', () => {
    test('protects teacher arena host screen from unauthenticated direct access', async ({
      page,
    }) => {
      await page.goto('/admin/arena/test-session-id')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*arena.*test-session-id/)
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    })
  })
})
