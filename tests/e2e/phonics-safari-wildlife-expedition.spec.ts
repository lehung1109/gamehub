// tests/e2e/phonics-safari-wildlife-expedition.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 26: Phonics Safari & Wildlife Nature Expedition E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates from homepage, explores biomes, snapshots animals through viewfinder, checks field guide, and audits typography', async ({
    page,
  }) => {
    // 1. Navigate from homepage topbar link
    await page.goto('/')
    const safariTopbarLink = page.getByTestId('safari-topbar-link')
    await expect(safariTopbarLink).toBeVisible()
    await safariTopbarLink.click()

    await expect(page).toHaveURL(/\/safari/)
    await expect(
      page.getByRole('heading', { name: /Thám Hiểm Safari Ngữ Âm/i })
    ).toBeVisible()

    // 2. Verify Initial Stats in Header
    await expect(page.getByText('Thám Tử Nhí 🧭')).toBeVisible()
    await expect(page.getByText(/Ảnh Đã Chụp: 0\/16/i)).toBeVisible()

    // 3. Biome Switching
    const rainforestTab = page.getByRole('tab', { name: /rừng nhiệt đới amazon/i })
    await expect(rainforestTab).toBeVisible()
    await rainforestTab.click()

    await expect(
      page.getByRole('heading', { name: /Rừng Nhiệt Đới Amazon \(Amazon Rainforest\)/i })
    ).toBeVisible()
    await expect(page.getByTestId('safari-animal-card-parrot')).toBeVisible()

    // Switch back to Savanna
    const savannaTab = page.getByRole('tab', { name: /thảo nguyên savanna/i })
    await savannaTab.click()
    await expect(
      page.getByRole('heading', { name: /Thảo Nguyên Savanna \(African Savanna\)/i })
    ).toBeVisible()

    // 4. Animal Photography: Snap photo of Lion
    const lionCard = page.getByTestId('safari-animal-card-lion')
    await expect(lionCard).toBeVisible()

    const captureLionBtn = page.getByRole('button', { name: /chụp ảnh sư tử/i })
    await expect(captureLionBtn).toBeVisible()
    await captureLionBtn.click()

    // 5. Viewfinder Camera Modal
    const cameraModal = page.getByRole('dialog', {
      name: /kính ngắm máy ảnh chụp sư tử/i,
    })
    await expect(cameraModal).toBeVisible()

    // Select correct option "Lion"
    const lionOption = cameraModal.getByRole('button', { name: 'Lion' })
    await expect(lionOption).toBeVisible()
    await lionOption.click()

    // Verify praise message and auto-dismiss
    await expect(page.getByText(/Tách! Bức ảnh tuyệt đẹp!/i)).toBeVisible()
    await expect(cameraModal).not.toBeVisible({ timeout: 5000 })

    // Photo counter updated to 1/16
    await expect(page.getByText(/Ảnh Đã Chụp: 1\/16/i)).toBeVisible()

    // 6. Open Wildlife Field Guide
    const fieldGuideBtn = page.getByRole('button', { name: /mở sổ tay bách khoa động vật/i })
    await expect(fieldGuideBtn).toBeVisible()
    await fieldGuideBtn.click()

    const fieldGuideModal = page.getByRole('dialog', {
      name: /sổ tay bách khoa động vật safari/i,
    })
    await expect(fieldGuideModal).toBeVisible()
    await expect(fieldGuideModal.getByText(/1\/16 loài/i)).toBeVisible()
    await expect(fieldGuideModal.getByText('Sư Tử', { exact: true })).toBeVisible()
    await expect(fieldGuideModal.getByText(/Tiếng gầm của sư tử đực/i)).toBeVisible()

    // Close Field Guide
    const closeFieldGuideBtn = page.getByRole('button', { name: /đóng sổ tay bách khoa/i })
    await closeFieldGuideBtn.click()
    await expect(fieldGuideModal).not.toBeVisible()

    // 7. Reset Progress
    const resetBtn = page.getByRole('button', { name: /đặt lại hành trình thám hiểm/i })
    await resetBtn.click()
    await expect(page.getByText(/Ảnh Đã Chụp: 0\/16/i)).toBeVisible()

    // 8. Strict Typography Audit (>= 16px) on main container
    const safariHtml = await page.locator('main').innerHTML()
    expect(safariHtml).not.toContain('text-xs')
    expect(safariHtml).not.toContain('text-sm')
    expect(safariHtml).not.toContain('text-[10px]')
    expect(safariHtml).not.toContain('text-[12px]')
    expect(safariHtml).not.toContain('text-[14px]')
  })
})
