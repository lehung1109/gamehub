// tests/e2e/phonics-space-odyssey.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 28: Phonics Space Odyssey & Cosmic Planet Explorer E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates from homepage, explores sectors, decodes radio beacon, checks compendium, and audits typography', async ({
    page,
  }) => {
    // 1. Navigate from homepage topbar link
    await page.goto('/')
    const spaceTopbarLink = page.getByTestId('space-topbar-link')
    await expect(spaceTopbarLink).toBeVisible()
    await spaceTopbarLink.click()

    await expect(page).toHaveURL(/\/space/)
    await expect(
      page.getByRole('heading', { name: /Thám Hiểm Vũ Trụ Phonics/i })
    ).toBeVisible()

    // 2. Verify Initial Stats in Header
    await expect(page.getByText('Thiếu Sinh Quân Vũ Trụ 🚀')).toBeVisible()
    await expect(page.getByText(/Nhiệm Vụ: 0\/12/i)).toBeVisible()
    await expect(page.getByText(/0 Tinh Thể 💎/i)).toBeVisible()

    // 3. Sector Switching
    const saturnTab = page.getByRole('tab', { name: /hành tinh vành đai sao thổ/i })
    await expect(saturnTab).toBeVisible()
    await saturnTab.click()

    await expect(
      page.getByRole('heading', { name: /Hành Tinh Vành Đai Sao Thổ \(Ringed Wonder Saturn\)/i })
    ).toBeVisible()
    await expect(page.getByTestId('space-mission-card-saturn-ring')).toBeVisible()

    // Switch back to Mars
    const marsTab = page.getByRole('tab', { name: /hành tinh sao hỏa đỏ/i })
    await marsTab.click()
    await expect(
      page.getByRole('heading', { name: /Hành Tinh Sao Hỏa Đỏ \(Red Desert Mars\)/i })
    ).toBeVisible()

    // 4. Mission: Mars Rover Landing
    const roverCard = page.getByTestId('space-mission-card-mars-rover')
    await expect(roverCard).toBeVisible()

    const startRoverBtn = page.getByRole('button', {
      name: /thực hiện nhiệm vụ hạ cánh robot sao hỏa/i,
    })
    await expect(startRoverBtn).toBeVisible()
    await startRoverBtn.click()

    // 5. Rover Modal
    const roverModal = page.getByRole('dialog', {
      name: /trạm điều khiển nhiệm vụ hạ cánh robot sao hỏa/i,
    })
    await expect(roverModal).toBeVisible()

    // Select correct option "ROCK"
    const rockOption = roverModal.getByRole('button', { name: 'ROCK' })
    await expect(rockOption).toBeVisible()
    await rockOption.click()

    // Verify praise message and auto-dismiss
    await expect(page.getByText(/Bíp bíp! Tín hiệu vũ trụ đã được giải mã!/i)).toBeVisible()
    await expect(roverModal).not.toBeVisible({ timeout: 5000 })

    // Stats updated: 1/12 missions, 3 crystals
    await expect(page.getByText(/Nhiệm Vụ: 1\/12/i)).toBeVisible()
    await expect(page.getByText(/3 Tinh Thể 💎/i)).toBeVisible()

    // 6. Open Space Compendium
    const compendiumBtn = page.getByRole('button', { name: /mở bách khoa thiên văn vũ trụ/i })
    await expect(compendiumBtn).toBeVisible()
    await compendiumBtn.click()

    const compendiumModal = page.getByRole('dialog', {
      name: /bách khoa thiên văn không gian vũ trụ/i,
    })
    await expect(compendiumModal).toBeVisible()
    await expect(compendiumModal.getByText(/1\/12 nhiệm vụ/i)).toBeVisible()
    await expect(
      compendiumModal.getByText('Hạ Cánh Robot Sao Hỏa', { exact: true })
    ).toBeVisible()

    // Close Compendium
    const closeCompendiumBtn = page.getByRole('button', { name: /đóng bách khoa thiên văn/i })
    await closeCompendiumBtn.click()
    await expect(compendiumModal).not.toBeVisible()

    // 7. Reset Progress
    const resetBtn = page.getByRole('button', { name: /đặt lại hành trình vũ trụ/i })
    await resetBtn.click()
    await expect(page.getByText(/Nhiệm Vụ: 0\/12/i)).toBeVisible()

    // 8. Strict Typography Audit (>= 16px) on main container
    const spaceHtml = await page.locator('main').innerHTML()
    expect(spaceHtml).not.toContain('text-xs')
    expect(spaceHtml).not.toContain('text-sm')
    expect(spaceHtml).not.toContain('text-[10px]')
    expect(spaceHtml).not.toContain('text-[12px]')
    expect(spaceHtml).not.toContain('text-[14px]')
  })
})
