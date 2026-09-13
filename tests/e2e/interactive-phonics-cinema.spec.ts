// tests/e2e/interactive-phonics-cinema.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 23: Interactive Phonics Cinema & Micro-Lessons E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates from homepage, filters episodes, interacts with dramatic pause prompt, collects popcorn, and verifies strict typography', async ({
    page,
  }) => {
    // 1. Navigate from homepage topbar link
    await page.goto('/')
    const topbarLink = page.getByTestId('cinema-topbar-link')
    await expect(topbarLink).toBeVisible()
    await topbarLink.click()

    await expect(page).toHaveURL(/\/cinema/)
    await expect(
      page.getByRole('heading', { name: /Rạp Chiếu Phim Phonics/i })
    ).toBeVisible()

    // 2. Verify all 3 curated episodes are listed
    await expect(page.getByText('Chú Khủng Long Đói Bụng', { exact: true })).toBeVisible()
    await expect(page.getByText('Nồi Thuốc Tiên Kỳ Diệu', { exact: true })).toBeVisible()
    await expect(page.getByText('Chiếc Thảm Bay Thần Kỳ', { exact: true })).toBeVisible()

    // 3. Test category filters
    const digraphFilterBtn = page.getByRole('button', { name: /Digraphs/i })
    await expect(digraphFilterBtn).toBeVisible()
    await digraphFilterBtn.click()

    await expect(page.getByText('Nồi Thuốc Tiên Kỳ Diệu', { exact: true })).toBeVisible()
    await expect(page.getByText('Chú Khủng Long Đói Bụng', { exact: true })).not.toBeVisible()

    const allFilterBtn = page.getByRole('button', { name: /Tất Cả Phim/i })
    await allFilterBtn.click()
    await expect(page.getByText('Chú Khủng Long Đói Bụng', { exact: true })).toBeVisible()

    // 4. Launch Episode 1: The Hungry Dino
    const dinoCard = page.locator('[data-testid="cinema-episode-card-the-hungry-dino"]')
    const playDinoLink = dinoCard.getByRole('link', { name: /vào xem phim ngay/i })
    await playDinoLink.click()

    await expect(page).toHaveURL(/\/cinema\/the-hungry-dino/)
    await expect(page.getByText('Cảnh 1: Bữa Sáng Của Rex', { exact: true })).toBeVisible()
    await expect(page.getByText('🦖')).toBeVisible()

    // 5. Test audio replay button
    const narrationBtn = page.getByRole('button', { name: /nghe lại lời kể tiếng Anh/i })
    await expect(narrationBtn).toBeVisible()
    await narrationBtn.click()

    // 6. Wait for dramatic pause prompt dialog to appear
    const promptModal = page.getByRole('dialog', {
      name: /thử thách tương tác rạp chiếu phim/i,
    })
    await expect(promptModal).toBeVisible({ timeout: 4000 })
    await expect(
      page.getByText(/Rex muốn tìm thức ăn có nguyên âm ngắn/i)
    ).toBeVisible()

    // 7. Solve prompt by choosing APPLE
    const appleBtn = page.getByRole('button', { name: /APPLE/i })
    await expect(appleBtn).toBeVisible()
    await appleBtn.click()

    // Verify feedback celebration message inside prompt
    await expect(page.getByText(/Quả táo/i)).toBeVisible()

    // 8. Wait for automatic unlock transition to Scene 2
    await expect(page.getByText('Cảnh 2: Vượt Suối Nhỏ', { exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Bắp Rang: 50', { exact: true })).toBeVisible()

    // 9. Strict Typography Audit (>= 16px) on Cinema route
    const cinemaHtml = await page.locator('main').innerHTML()
    expect(cinemaHtml).not.toContain('text-xs')
    expect(cinemaHtml).not.toContain('text-sm')
    expect(cinemaHtml).not.toContain('text-[10px]')
    expect(cinemaHtml).not.toContain('text-[12px]')
    expect(cinemaHtml).not.toContain('text-[14px]')
  })
})
