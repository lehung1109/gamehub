// tests/e2e/phonics-kitchen-masterchef.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 27: Phonics Kitchen & Junior MasterChef Academy E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates from homepage, explores stations, cooks recipe on workbench, checks recipe book, and audits typography', async ({
    page,
  }) => {
    // 1. Navigate from homepage topbar link
    await page.goto('/')
    const kitchenTopbarLink = page.getByTestId('kitchen-topbar-link')
    await expect(kitchenTopbarLink).toBeVisible()
    await kitchenTopbarLink.click()

    await expect(page).toHaveURL(/\/kitchen/)
    await expect(
      page.getByRole('heading', { name: /Bếp Trưởng Nhí Phonics/i })
    ).toBeVisible()

    // 2. Verify Initial Stats in Header
    await expect(page.getByText('Phụ Bếp Nhí 🥄')).toBeVisible()
    await expect(page.getByText(/Món Đã Nấu: 0\/12/i)).toBeVisible()
    await expect(page.getByText(/0 Sao/i)).toBeVisible()

    // 3. Station Switching
    const sushiTab = page.getByRole('tab', { name: /quầy sushi & ramen tokyo/i })
    await expect(sushiTab).toBeVisible()
    await sushiTab.click()

    await expect(
      page.getByRole('heading', { name: /Quầy Sushi & Ramen Tokyo \(Tokyo Sushi & Ramen Bar\)/i })
    ).toBeVisible()
    await expect(page.getByTestId('kitchen-recipe-card-salmon-nigiri')).toBeVisible()

    // Switch back to Pizzeria
    const pizzeriaTab = page.getByRole('tab', { name: /tiệm pizza & mì ý/i })
    await pizzeriaTab.click()
    await expect(
      page.getByRole('heading', { name: /Tiệm Pizza & Mì Ý \(Italian Pizzeria & Pasta\)/i })
    ).toBeVisible()

    // 4. Cook Margherita Pizza
    const pizzaCard = page.getByTestId('kitchen-recipe-card-margherita-pizza')
    await expect(pizzaCard).toBeVisible()

    const cookPizzaBtn = page.getByRole('button', { name: /nấu món pizza margherita/i })
    await expect(cookPizzaBtn).toBeVisible()
    await cookPizzaBtn.click()

    // 5. Workbench Modal
    const workbenchModal = page.getByRole('dialog', {
      name: /bàn chế biến món pizza margherita/i,
    })
    await expect(workbenchModal).toBeVisible()

    // Select correct option "HAM"
    const hamOption = workbenchModal.getByRole('button', { name: 'HAM' })
    await expect(hamOption).toBeVisible()
    await hamOption.click()

    // Verify praise message and auto-dismiss
    await expect(page.getByText(/Xèo xèo! Món ăn đã chín vàng thơm phức!/i)).toBeVisible()
    await expect(workbenchModal).not.toBeVisible({ timeout: 5000 })

    // Stats updated: 1/12 dishes, 3 stars
    await expect(page.getByText(/Món Đã Nấu: 1\/12/i)).toBeVisible()
    await expect(page.getByText(/3 Sao/i)).toBeVisible()

    // 6. Open MasterChef Recipe Book
    const recipeBookBtn = page.getByRole('button', { name: /mở sổ tay công thức món ăn/i })
    await expect(recipeBookBtn).toBeVisible()
    await recipeBookBtn.click()

    const recipeBookModal = page.getByRole('dialog', {
      name: /sổ tay công thức món ăn masterchef/i,
    })
    await expect(recipeBookModal).toBeVisible()
    await expect(recipeBookModal.getByText(/1\/12 món/i)).toBeVisible()
    await expect(
      recipeBookModal.getByText('Pizza Margherita Truyền Thống', { exact: true })
    ).toBeVisible()

    // Close Recipe Book
    const closeBookBtn = page.getByRole('button', { name: /đóng sổ tay công thức/i })
    await closeBookBtn.click()
    await expect(recipeBookModal).not.toBeVisible()

    // 7. Reset Progress
    const resetBtn = page.getByRole('button', { name: /đặt lại tiến trình nấu ăn/i })
    await resetBtn.click()
    await expect(page.getByText(/Món Đã Nấu: 0\/12/i)).toBeVisible()

    // 8. Strict Typography Audit (>= 16px) on main container
    const kitchenHtml = await page.locator('main').innerHTML()
    expect(kitchenHtml).not.toContain('text-xs')
    expect(kitchenHtml).not.toContain('text-sm')
    expect(kitchenHtml).not.toContain('text-[10px]')
    expect(kitchenHtml).not.toContain('text-[12px]')
    expect(kitchenHtml).not.toContain('text-[14px]')
  })
})
