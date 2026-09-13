// tests/e2e/phonics-dino-park.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 31: Phonics Dino Kingdom & Prehistoric Fossils Archeology E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates from homepage, excavates dinosaur fossil, unlocks museum display, and audits typography', async ({
    page,
  }) => {
    // 1. Navigate from homepage topbar link
    await page.goto('/')
    const dinoTopbarLink = page.getByTestId('dino-topbar-link')
    await expect(dinoTopbarLink).toBeVisible()
    await dinoTopbarLink.click()

    await expect(page).toHaveURL(/\/dino/)
    await expect(
      page.getByRole('heading', { name: /Vương Quốc Khủng Long & Khảo Cổ Tiền Sử/i })
    ).toBeVisible()

    // 2. Verify Initial Stats in Header
    await expect(page.getByText('Nhà Khảo Cổ Tập Sự 🔍')).toBeVisible()
    await expect(page.getByText(/Hóa Thạch: 0\/12/i)).toBeVisible()
    await expect(page.getByText(/0 Hổ Phách 💎/i)).toBeVisible()

    // 3. Era Tab check
    const triassicTab = page.getByRole('tab', { name: /thung lũng tam điệp/i })
    await expect(triassicTab).toBeVisible()

    // 4. Fossil Card: Fossil Dig (DIG)
    const digCard = page.getByTestId('dino-fossil-card-triassic-dig')
    await expect(digCard).toBeVisible()

    const startDigBtn = digCard.getByRole('button', {
      name: /khai quật/i,
    })
    await expect(startDigBtn).toBeVisible()
    await startDigBtn.click()

    // 5. Fossil Dig Modal
    const digModal = page.getByRole('dialog', {
      name: /hầm khai quật hóa thạch khai quật hóa thạch/i,
    })
    await expect(digModal).toBeVisible()

    // Tap bone pieces 'D', 'I', 'G'
    const dBone = digModal.getByRole('button', { name: /mảnh xương d/i })
    const iBone = digModal.getByRole('button', { name: /mảnh xương i/i })
    const gBone = digModal.getByRole('button', { name: /mảnh xương g/i })

    await dBone.click()
    await iBone.click()
    await gBone.click()

    await expect(digModal.getByText('DIG', { exact: true })).toBeVisible()

    // Click Complete Excavation verification button
    const completeExcavationBtn = digModal.getByRole('button', {
      name: /hoàn thành khai quật/i,
    })
    await completeExcavationBtn.click()

    // Verify feedback message & auto-dismiss
    await expect(page.getByText(/Khai quật thành công!/i)).toBeVisible()
    await expect(digModal).not.toBeVisible({ timeout: 6000 })

    // Stats updated: 1/12 fossils, 50 amber gems
    await expect(page.getByText(/Hóa Thạch: 1\/12/i)).toBeVisible()
    await expect(page.getByText(/50 Hổ Phách 💎/i)).toBeVisible()

    // 6. Open Prehistoric Museum
    const museumBtn = page.getByRole('button', {
      name: /mở viện bảo tàng tiền sử fossil museum/i,
    })
    await expect(museumBtn).toBeVisible()
    await museumBtn.click()

    const museumModal = page.getByRole('dialog', {
      name: /viện bảo tàng khủng long và tiền sử/i,
    })
    await expect(museumModal).toBeVisible()
    await expect(museumModal.getByText(/1\/12 hóa thạch/i)).toBeVisible()
    await expect(
      museumModal.getByText('Khai Quật Hóa Thạch', { exact: true })
    ).toBeVisible()

    // Close Museum
    const closeMuseumBtn = page.getByRole('button', { name: /đóng viện bảo tàng/i })
    await closeMuseumBtn.click()
    await expect(museumModal).not.toBeVisible()

    // 7. Reset Progress
    const resetBtn = page.getByRole('button', { name: /đặt lại hành trình khảo cổ khủng long/i })
    await resetBtn.click()
    await expect(page.getByText(/Hóa Thạch: 0\/12/i)).toBeVisible()

    // 8. Strict Typography Audit (>= 16px) on main container
    const dinoHtml = await page.locator('main').innerHTML()
    expect(dinoHtml).not.toContain('text-xs')
    expect(dinoHtml).not.toContain('text-sm')
    expect(dinoHtml).not.toContain('text-[10px]')
    expect(dinoHtml).not.toContain('text-[12px]')
    expect(dinoHtml).not.toContain('text-[14px]')
  })
})
