// tests/e2e/phonics-spelling-bee-championship.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 22: Phonics Spelling Bee Championship E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates to spelling bee hub, enters Bronze Bee arena, spells word via keyboard, and verifies strict typography', async ({
    page,
  }) => {
    // 1. Navigate from homepage topbar link
    await page.goto('/')
    const topbarLink = page.getByTestId('spelling-bee-topbar-link')
    await expect(topbarLink).toBeVisible()
    await topbarLink.click()

    await expect(page).toHaveURL(/\/spelling-bee/)
    await expect(page.getByRole('heading', { name: /Đấu Trường Đánh Vần/i })).toBeVisible()

    // 2. Verify all divisions are listed
    await expect(page.getByText('Bronze Bee Championship')).toBeVisible()
    await expect(page.getByText('Silver Bee Championship')).toBeVisible()
    await expect(page.getByText('Golden Bee Championship')).toBeVisible()

    // 3. Launch Bronze Bee Division
    const playBronzeLink = page
      .locator('[data-testid="spelling-bee-division-card-bronze-bee"]')
      .getByRole('link', { name: /vào đấu trường ngay/i })
    await playBronzeLink.click()

    await expect(page).toHaveURL(/\/spelling-bee\/bronze-bee/)
    await expect(page.getByRole('heading', { name: 'Hạng Ong Đồng - Khởi Động' })).toBeVisible()

    // 4. Test clue controls
    const listenBtn = page.getByRole('button', { name: /nghe phát âm từ vựng/i })
    await expect(listenBtn).toBeVisible()
    await listenBtn.click()

    const hintBtn = page.getByRole('button', { name: /gợi ý/i })
    await expect(hintBtn).toBeVisible()
    await hintBtn.click()
    await expect(page.getByText(/Ngữ âm:/i)).toBeVisible()

    // 5. Spell CAT using touch keyboard
    await page.getByRole('button', { name: 'Chữ cái C', exact: true }).click()
    await page.getByRole('button', { name: 'Chữ cái A', exact: true }).click()
    await page.getByRole('button', { name: 'Chữ cái T', exact: true }).click()

    // Check letter slots
    await expect(page.getByTestId('spelling-letter-slot-0')).toHaveText('C')
    await expect(page.getByTestId('spelling-letter-slot-1')).toHaveText('A')
    await expect(page.getByTestId('spelling-letter-slot-2')).toHaveText('T')

    // Submit word
    const submitBtn = page.getByRole('button', { name: /xác nhận gửi từ đánh vần/i })
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // Verify celebration overlay
    await expect(page.getByText(/CHÍNH XÁC/i)).toBeVisible()

    // 6. Strict Typography Audit (>= 16px) on main tournament arena
    const arenaHtml = await page.locator('main').innerHTML()
    expect(arenaHtml).not.toContain('text-xs')
    expect(arenaHtml).not.toContain('text-sm')
    expect(arenaHtml).not.toContain('text-[10px]')
    expect(arenaHtml).not.toContain('text-[12px]')
    expect(arenaHtml).not.toContain('text-[14px]')
  })
})
