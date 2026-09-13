// tests/e2e/phonics-ocean-explorer.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 29: Phonics Ocean Explorer & Deep Sea Submarine E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates from homepage, decodes sonar acoustic beacon, unlocks compendium card, and audits typography', async ({
    page,
  }) => {
    // 1. Navigate from homepage topbar link
    await page.goto('/')
    const oceanTopbarLink = page.getByTestId('ocean-topbar-link')
    await expect(oceanTopbarLink).toBeVisible()
    await oceanTopbarLink.click()

    await expect(page).toHaveURL(/\/ocean/)
    await expect(
      page.getByRole('heading', { name: /Thám Hiểm Đại Dương & Tàu Ngầm Ngữ Âm/i })
    ).toBeVisible()

    // 2. Verify Initial Stats in Header
    await expect(page.getByText('Thợ Lặn Tập Sự 🤿')).toBeVisible()
    await expect(page.getByText(/Nhiệm Vụ: 0\/12/i)).toBeVisible()
    await expect(page.getByText(/0 Ngọc Trai 🦪/i)).toBeVisible()

    // 3. Zone Tab check
    const sunlightTab = page.getByRole('tab', { name: /tầng ánh nắng/i })
    await expect(sunlightTab).toBeVisible()

    // 4. Mission Card: Clownfish Fin
    const finCard = page.getByTestId('ocean-mission-card-sunlight-fin')
    await expect(finCard).toBeVisible()

    const startFinBtn = page.getByRole('button', {
      name: /thực hiện nhiệm vụ vây cá hề nhiệt đới/i,
    })
    await expect(startFinBtn).toBeVisible()
    await startFinBtn.click()

    // 5. Submarine Sonar Modal
    const sonarModal = page.getByRole('dialog', {
      name: /trạm sonar tàu ngầm vây cá hề nhiệt đới/i,
    })
    await expect(sonarModal).toBeVisible()

    // Tap bubbles 'F', 'I', 'N'
    const fBubble = sonarModal.getByRole('button', { name: /🫧 F/i })
    const iBubble = sonarModal.getByRole('button', { name: /🫧 I/i })
    const nBubble = sonarModal.getByRole('button', { name: /🫧 N/i })

    await fBubble.click()
    await iBubble.click()
    await nBubble.click()

    await expect(sonarModal.getByText('FIN', { exact: true })).toBeVisible()

    // Click Emit Sonar verification button
    const emitSonarBtn = sonarModal.getByRole('button', {
      name: /phát sóng sonar khóa mục tiêu/i,
    })
    await emitSonarBtn.click()

    // Verify feedback message & auto-dismiss
    await expect(page.getByText(/Tuyệt vời! Bạn đã mở khóa Clownfish/i)).toBeVisible()
    await expect(sonarModal).not.toBeVisible({ timeout: 6000 })

    // Stats updated: 1/12 missions, 50 pearls
    await expect(page.getByText(/Nhiệm Vụ: 1\/12/i)).toBeVisible()
    await expect(page.getByText(/50 Ngọc Trai 🦪/i)).toBeVisible()

    // 6. Open Ocean Compendium
    const compendiumBtn = page.getByRole('button', {
      name: /mở bách khoa sinh vật đại dương/i,
    })
    await expect(compendiumBtn).toBeVisible()
    await compendiumBtn.click()

    const compendiumModal = page.getByRole('dialog', {
      name: /bách khoa sinh vật đại dương/i,
    })
    await expect(compendiumModal).toBeVisible()
    await expect(compendiumModal.getByText(/1\/12 nhiệm vụ/i)).toBeVisible()
    await expect(
      compendiumModal.getByText('Vây Cá Hề Nhiệt Đới', { exact: true })
    ).toBeVisible()

    // Close Compendium
    const closeCompendiumBtn = page.getByRole('button', { name: /đóng bách khoa đại dương/i })
    await closeCompendiumBtn.click()
    await expect(compendiumModal).not.toBeVisible()

    // 7. Reset Progress
    const resetBtn = page.getByRole('button', { name: /đặt lại hành trình thám hiểm biển/i })
    await resetBtn.click()
    await expect(page.getByText(/Nhiệm Vụ: 0\/12/i)).toBeVisible()

    // 8. Strict Typography Audit (>= 16px) on main container
    const oceanHtml = await page.locator('main').innerHTML()
    expect(oceanHtml).not.toContain('text-xs')
    expect(oceanHtml).not.toContain('text-sm')
    expect(oceanHtml).not.toContain('text-[10px]')
    expect(oceanHtml).not.toContain('text-[12px]')
    expect(oceanHtml).not.toContain('text-[14px]')
  })
})
