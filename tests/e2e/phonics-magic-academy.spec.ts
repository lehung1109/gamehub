// tests/e2e/phonics-magic-academy.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 30: Phonics Magic Academy & Wizard Spellcraft Studio E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates from homepage, casts elemental spell, unlocks grimoire parchment, and audits typography', async ({
    page,
  }) => {
    // 1. Navigate from homepage topbar link
    await page.goto('/')
    const magicTopbarLink = page.getByTestId('magic-topbar-link')
    await expect(magicTopbarLink).toBeVisible()
    await magicTopbarLink.click()

    await expect(page).toHaveURL(/\/magic/)
    await expect(
      page.getByRole('heading', { name: /Học Viện Phép Thuật & Thần Chú Ngữ Âm/i })
    ).toBeVisible()

    // 2. Verify Initial Stats in Header
    await expect(page.getByText('Pháp Sư Tập Sự 🪄')).toBeVisible()
    await expect(page.getByText(/Thần Chú: 0\/12/i)).toBeVisible()
    await expect(page.getByText(/0 Pha Lê 🔮/i)).toBeVisible()

    // 3. Tower Tab check
    const fireTab = page.getByRole('tab', { name: /tháp lửa/i })
    await expect(fireTab).toBeVisible()

    // 4. Spell Card: Flame Spark (HOT)
    const hotCard = page.getByTestId('magic-spell-card-fire-hot')
    await expect(hotCard).toBeVisible()

    const startHotBtn = page.getByRole('button', {
      name: /niệm phép thần chú đốm lửa nóng bỏng/i,
    })
    await expect(startHotBtn).toBeVisible()
    await startHotBtn.click()

    // 5. Wand Incantation Modal
    const incantationModal = page.getByRole('dialog', {
      name: /điện thờ niệm phép đốm lửa nóng bỏng/i,
    })
    await expect(incantationModal).toBeVisible()

    // Tap runes 'H', 'O', 'T'
    const hRune = incantationModal.getByRole('button', { name: /✨ H/i })
    const oRune = incantationModal.getByRole('button', { name: /✨ O/i })
    const tRune = incantationModal.getByRole('button', { name: /✨ T/i })

    await hRune.click()
    await oRune.click()
    await tRune.click()

    await expect(incantationModal.getByText('HOT', { exact: true })).toBeVisible()

    // Click Cast Spell verification button
    const castSpellBtn = incantationModal.getByRole('button', {
      name: /vẫy đũa niệm phép thần chú/i,
    })
    await castSpellBtn.click()

    // Verify feedback message & auto-dismiss
    await expect(page.getByText(/Thần chú khai mở thành công!/i)).toBeVisible()
    await expect(incantationModal).not.toBeVisible({ timeout: 6000 })

    // Stats updated: 1/12 spells, 50 crystals
    await expect(page.getByText(/Thần Chú: 1\/12/i)).toBeVisible()
    await expect(page.getByText(/50 Pha Lê 🔮/i)).toBeVisible()

    // 6. Open Ancient Grimoire
    const grimoireBtn = page.getByRole('button', {
      name: /mở sách ma thuật cổ grimoire/i,
    })
    await expect(grimoireBtn).toBeVisible()
    await grimoireBtn.click()

    const grimoireModal = page.getByRole('dialog', {
      name: /sách ma thuật cổ grimoire/i,
    })
    await expect(grimoireModal).toBeVisible()
    await expect(grimoireModal.getByText(/1\/12 thần chú/i)).toBeVisible()
    await expect(
      grimoireModal.getByText('Đốm Lửa Nóng Bỏng', { exact: true })
    ).toBeVisible()

    // Close Grimoire
    const closeGrimoireBtn = page.getByRole('button', { name: /đóng sách ma thuật grimoire/i })
    await closeGrimoireBtn.click()
    await expect(grimoireModal).not.toBeVisible()

    // 7. Reset Progress
    const resetBtn = page.getByRole('button', { name: /đặt lại hành trình học viện phép thuật/i })
    await resetBtn.click()
    await expect(page.getByText(/Thần Chú: 0\/12/i)).toBeVisible()

    // 8. Strict Typography Audit (>= 16px) on main container
    const magicHtml = await page.locator('main').innerHTML()
    expect(magicHtml).not.toContain('text-xs')
    expect(magicHtml).not.toContain('text-sm')
    expect(magicHtml).not.toContain('text-[10px]')
    expect(magicHtml).not.toContain('text-[12px]')
    expect(magicHtml).not.toContain('text-[14px]')
  })
})
