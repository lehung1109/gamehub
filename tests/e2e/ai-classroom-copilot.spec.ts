// tests/e2e/ai-classroom-copilot.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 14: AI Classroom Co-Pilot & Granular Phoneme Assessment E2E', () => {
  test.describe('Admin Route Protection for AI Co-Pilot', () => {
    test('redirects unauthenticated user accessing /admin/ai-copilot to /login', async ({ page }) => {
      await page.goto('/admin/ai-copilot')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*ai-copilot/)
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    })
  })

  test.describe('Pronunciation Lab with Granular Phoneme Assessment', () => {
    test.beforeEach(async ({ page }) => {
      await mockAnonymousStudent(page)
    })

    test('navigates to pronunciation lab and displays phoneme card with speech controls', async ({
      page,
    }) => {
      await page.goto('/games/pronunciation')

      // Main heading & description
      await expect(
        page.getByRole('heading', { name: /phòng luyện phát âm/i })
      ).toBeVisible()

      // Target phonetic item card
      await expect(page.getByText('ship')).toBeVisible()
      await expect(page.getByText('/ʃɪp/')).toBeVisible()

      // Pronunciation controls
      const listenBtn = page.getByRole('button', { name: /nghe phát âm mẫu/i })
      await expect(listenBtn).toBeVisible()

      // Microphone control button or browser speech support message
      const micElement = page
        .getByTestId('mic-toggle-button')
        .or(page.getByText(/trình duyệt của bạn chưa hỗ trợ/i))
      await expect(micElement).toBeVisible()
    })

    test('verifies kid-friendly typography on arena entry and AI Co-Pilot features', async ({
      page,
    }) => {
      await page.goto('/arena')

      // Auditing arena entry page for forbidden text classes
      const arenaHtml = await page.content()
      expect(arenaHtml).not.toContain('text-xs')
      expect(arenaHtml).not.toContain('text-sm')
      expect(arenaHtml).not.toContain('text-[10px]')
      expect(arenaHtml).not.toContain('text-[12px]')
      expect(arenaHtml).not.toContain('text-[14px]')
    })
  })
})
