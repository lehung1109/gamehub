// tests/e2e/phonics-time-machine.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 32: Phonics Time Machine & Historical Civilizations Adventure E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates from homepage, restores historical relic, unlocks museum display, and audits typography', async ({
    page,
  }) => {
    // 1. Navigate from homepage topbar link
    await page.goto('/')
    const timetravelTopbarLink = page.getByTestId('timetravel-topbar-link')
    await expect(timetravelTopbarLink).toBeVisible()
    await timetravelTopbarLink.click()

    await expect(page).toHaveURL(/\/timetravel/)
    await expect(
      page.getByRole('heading', { name: /Cỗ Máy Thời Gian & Cuộc Du Hành Lịch Sử/i })
    ).toBeVisible()

    // 2. Verify Initial Stats in Header
    await expect(page.getByText('Nhà Du Hành Tập Sự 🧭')).toBeVisible()
    await expect(page.getByText(/Cổ Vật: 0\/12/i)).toBeVisible()
    await expect(page.getByText(/0 Bảo Ngọc ⏳/i)).toBeVisible()

    // 3. Era Tab check
    const egyptTab = page.getByRole('tab', { name: /ancient egypt/i })
    await expect(egyptTab).toBeVisible()

    // 4. Relic Card: Solar Disc of Ra (SUN)
    const sunCard = page.getByTestId('time-relic-card-egypt-sun')
    await expect(sunCard).toBeVisible()

    const startRestoreBtn = sunCard.getByRole('button', {
      name: /khôi phục cổ vật/i,
    })
    await expect(startRestoreBtn).toBeVisible()
    await startRestoreBtn.click()

    // 5. Chrono Capsule Modal
    const capsuleModal = page.getByRole('dialog', {
      name: /hầm giải mã cổ vật thần mặt trời ra/i,
    })
    await expect(capsuleModal).toBeVisible()

    // Tap rune pieces 'S', 'U', 'N'
    const sRune = capsuleModal.getByRole('button', { name: /mảnh rune s/i })
    const uRune = capsuleModal.getByRole('button', { name: /mảnh rune u/i })
    const nRune = capsuleModal.getByRole('button', { name: /mảnh rune n/i })

    await sRune.click()
    await uRune.click()
    await nRune.click()

    await expect(capsuleModal.getByText('SUN', { exact: true })).toBeVisible()

    // Click Complete Restoration button
    const completeBtn = capsuleModal.getByRole('button', {
      name: /khôi phục bảo vật/i,
    })
    await completeBtn.click()

    // Verify feedback message & auto-dismiss
    await expect(page.getByText(/Khôi phục thành công!/i)).toBeVisible()
    await expect(capsuleModal).not.toBeVisible({ timeout: 6000 })

    // Stats updated: 1/12 relics, 50 chrono-orbs
    await expect(page.getByText(/Cổ Vật: 1\/12/i)).toBeVisible()
    await expect(page.getByText(/50 Bảo Ngọc ⏳/i)).toBeVisible()

    // 6. Open Time Museum
    const museumBtn = page.getByRole('button', {
      name: /mở viện bảo tàng không thời gian time museum/i,
    })
    await expect(museumBtn).toBeVisible()
    await museumBtn.click()

    const museumModal = page.getByRole('dialog', {
      name: /viện bảo tàng không thời gian time museum/i,
    })
    await expect(museumModal).toBeVisible()
    await expect(museumModal.getByText(/1\/12 cổ vật/i)).toBeVisible()
    await expect(
      museumModal.getByText('Thần Mặt Trời Ra', { exact: true })
    ).toBeVisible()

    // Close Museum
    const closeMuseumBtn = page.getByRole('button', { name: /đóng viện bảo tàng/i })
    await closeMuseumBtn.click()
    await expect(museumModal).not.toBeVisible()

    // 7. Reset Progress
    const resetBtn = page.getByRole('button', { name: /đặt lại hành trình cỗ máy thời gian/i })
    await resetBtn.click()
    await expect(page.getByText(/Cổ Vật: 0\/12/i)).toBeVisible()

    // 8. Strict Typography Audit (>= 16px) on main container
    const timetravelHtml = await page.locator('main').innerHTML()
    expect(timetravelHtml).not.toContain('text-xs')
    expect(timetravelHtml).not.toContain('text-sm')
    expect(timetravelHtml).not.toContain('text-[10px]')
    expect(timetravelHtml).not.toContain('text-[12px]')
    expect(timetravelHtml).not.toContain('text-[14px]')
  })
})
