// tests/e2e/phonics-town-world-builder.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 25: Phonics Town & Interactive Vocabulary World Builder E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates from homepage, constructs building, completes resident quest, upgrades building, resets town, and verifies strict typography', async ({
    page,
  }) => {
    // 1. Navigate from homepage topbar link
    await page.goto('/')
    const townTopbarLink = page.getByTestId('town-topbar-link')
    await expect(townTopbarLink).toBeVisible()
    await townTopbarLink.click()

    await expect(page).toHaveURL(/\/town/)
    await expect(
      page.getByRole('heading', { name: /Thành Phố Ngữ Âm Phonics/i })
    ).toBeVisible()

    // 2. Verify Initial Stats in Header
    await expect(page.getByText('Thị Trưởng Tập Sự 🏅')).toBeVisible()
    await expect(page.getByText(/Gạch Xây Dựng: 150/i)).toBeVisible()
    await expect(page.getByText(/Thịnh Vượng: 0/i)).toBeVisible()

    // 3. Verify Empty Slots
    await expect(page.getByText('Ô Đất Trống #1')).toBeVisible()

    // 4. Construct First Building on Slot 1 (Bakery - costs 50 bricks)
    const buildSlot1Btn = page.getByRole('button', { name: /xây dựng công trình tại ô 1/i })
    await expect(buildSlot1Btn).toBeVisible()
    await buildSlot1Btn.click()

    const buildModal = page.getByRole('dialog', { name: /menu xây dựng công trình mới/i })
    await expect(buildModal).toBeVisible()
    await expect(page.getByText('Tiệm Bánh Nắng Mai')).toBeVisible()

    const buildBakeryBtn = buildModal.getByRole('button', { name: /xây dựng ngay/i }).first()
    await buildBakeryBtn.click()

    // Verify bakery is built on slot 1
    const bakeryCard = page.getByTestId('town-building-card-bakery')
    await expect(bakeryCard).toBeVisible()
    await expect(page.getByText('Cấp 1: Xe Bánh Mì Dạo')).toBeVisible()
    // Bricks 150 - 50 = 100, Prosperity Stars 0 + 20 = 20
    await expect(page.getByText(/Gạch Xây Dựng: 100/i)).toBeVisible()
    await expect(page.getByText(/Thịnh Vượng: 20/i)).toBeVisible()

    // 5. Complete Resident Quest with Baker Bob (+30 bricks, +15 stars)
    const meetResidentBtn = page.getByRole('button', { name: /gặp cư dân baker bob/i })
    await expect(meetResidentBtn).toBeVisible()
    await meetResidentBtn.click()

    const questModal = page.getByRole('dialog', { name: /nhiệm vụ cư dân thị trấn/i })
    await expect(questModal).toBeVisible()
    await expect(page.getByText('Baker Bob')).toBeVisible()
    await expect(page.getByText(/Nguyên liệu nào có nguyên âm ngắn \/e\//i)).toBeVisible()

    // Click correct answer EGG
    const eggOption = questModal.getByRole('button', { name: /egg/i })
    await expect(eggOption).toBeVisible()
    await eggOption.click()

    // Verify success celebration message and modal auto-dismissal
    await expect(page.getByText(/Tuyệt vời! Cư dân vô cùng cảm ơn Thị trưởng!/i)).toBeVisible()
    await expect(questModal).not.toBeVisible({ timeout: 5000 })

    // Stats updated: 100 + 30 = 130 bricks, 20 + 15 = 35 stars
    await expect(page.getByText(/Gạch Xây Dựng: 130/i)).toBeVisible()
    await expect(page.getByText(/Thịnh Vượng: 35/i)).toBeVisible()

    // 6. Upgrade Building to Level 2 (costs 100 bricks)
    const upgradeBtn = page.getByRole('button', { name: /nâng cấp lên cấp 2/i })
    await expect(upgradeBtn).toBeVisible()
    await upgradeBtn.click()

    await expect(page.getByText('Cấp 2: Tiệm Bánh Nóng Hổi')).toBeVisible()
    // Bricks: 130 - 100 = 30 bricks
    await expect(page.getByText(/Gạch Xây Dựng: 30/i)).toBeVisible()

    // 7. Test Reset Town
    const resetTownBtn = page.getByRole('button', { name: /bắt đầu lại thành phố mới/i })
    await resetTownBtn.click()

    // Slot 1 should be empty again
    await expect(page.getByText('Ô Đất Trống #1')).toBeVisible()
    await expect(page.getByText(/Gạch Xây Dựng: 150/i)).toBeVisible()
    await expect(page.getByText(/Thịnh Vượng: 0/i)).toBeVisible()

    // 8. Strict Typography Audit (>= 16px) on main route container
    const townHtml = await page.locator('main').innerHTML()
    expect(townHtml).not.toContain('text-xs')
    expect(townHtml).not.toContain('text-sm')
    expect(townHtml).not.toContain('text-[10px]')
    expect(townHtml).not.toContain('text-[12px]')
    expect(townHtml).not.toContain('text-[14px]')
  })
})
