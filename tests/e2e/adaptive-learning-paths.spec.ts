// tests/e2e/adaptive-learning-paths.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 15: Adaptive Diagnostic Learning Paths E2E', () => {
  test.describe('Admin Route Protection for Diagnostics Heatmap', () => {
    test('redirects unauthenticated user accessing /admin/diagnostics to /login', async ({ page }) => {
      await page.goto('/admin/diagnostics')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*diagnostics/)
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
    })
  })

  test.describe('Student Learning Experience & Typography Audit', () => {
    test.beforeEach(async ({ page }) => {
      await mockAnonymousStudent(page)
    })

    test('verifies kid-friendly typography and navigation safety on student routes', async ({
      page,
    }) => {
      await page.goto('/arena')

      // Auditing arena entry page for forbidden small text classes
      const arenaHtml = await page.content()
      expect(arenaHtml).not.toContain('text-xs')
      expect(arenaHtml).not.toContain('text-sm')
      expect(arenaHtml).not.toContain('text-[10px]')
      expect(arenaHtml).not.toContain('text-[12px]')
      expect(arenaHtml).not.toContain('text-[14px]')

      // Verify header presence
      await expect(
        page.getByRole('heading', { name: /tham gia đấu trường trực tiếp/i })
      ).toBeVisible()
    })
  })
})
