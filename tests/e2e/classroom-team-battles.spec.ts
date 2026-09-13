// tests/e2e/classroom-team-battles.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 16: Classroom Team Battles & Arena Tournaments E2E', () => {
  test.describe('Admin Route Protection for Team Arena Management', () => {
    test('redirects unauthenticated user accessing /admin/arena/new to /login', async ({ page }) => {
      await page.goto('/admin/arena/new')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*arena.*new/)
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    })
  })

  test.describe('Arena Student Entry & Team Typography Audit', () => {
    test.beforeEach(async ({ page }) => {
      await mockAnonymousStudent(page)
    })

    test('renders arena entry screen with PIN form and satisfies strict typography', async ({
      page,
    }) => {
      await page.goto('/arena')

      await expect(
        page.getByRole('heading', { name: /tham gia đấu trường trực tiếp/i })
      ).toBeVisible()

      const pinInput = page.getByPlaceholder('123456')
      await expect(pinInput).toBeVisible()

      const nameInput = page.getByPlaceholder(/nhập tên hoặc biệt danh/i)
      await expect(nameInput).toBeVisible()

      const enterBtn = page.getByRole('button', { name: /vào phòng đấu/i })
      await expect(enterBtn).toBeVisible()

      // Kid-friendly typography audit: ensure zero forbidden small text classes
      const pageHtml = await page.content()
      expect(pageHtml).not.toContain('text-xs')
      expect(pageHtml).not.toContain('text-sm')
      expect(pageHtml).not.toContain('text-[10px]')
      expect(pageHtml).not.toContain('text-[12px]')
      expect(pageHtml).not.toContain('text-[14px]')
    })
  })
})
