import { test, expect } from '@playwright/test'

test.describe('Memory Match Game E2E Flows', () => {
  test('navigates from homepage to memory match game', async ({ page }) => {
    await page.goto('/')

    const memoryMatchLink = page.getByRole('link', { name: /Lật thẻ tìm cặp/i })
    await expect(memoryMatchLink).toBeVisible()

    await memoryMatchLink.click()
    await expect(page).toHaveURL(/\/games\/memory-match/)
    await expect(page.locator('h1')).toContainText('Ghép Hình Ảnh & Từ Tiếng Anh')
  })

  test('renders board and toggles difficulty pair counts', async ({ page }) => {
    await page.goto('/games/memory-match')

    // Verify 6 pairs (12 cards) is default
    const cardsDefault = page.getByRole('button', { name: /Thẻ úp/i })
    await expect(cardsDefault).toHaveCount(12)

    // Switch to 4 pairs
    const btn4 = page.getByRole('button', { name: /4 cặp/i })
    await btn4.click()
    const cards4 = page.getByRole('button', { name: /Thẻ úp/i })
    await expect(cards4).toHaveCount(8)

    // Switch to 8 pairs
    const btn8 = page.getByRole('button', { name: /8 cặp/i })
    await btn8.click()
    const cards8 = page.getByRole('button', { name: /Thẻ úp/i })
    await expect(cards8).toHaveCount(16)
  })

  test('interacts with cards and handles topic switching', async ({ page }) => {
    await page.goto('/games/memory-match')

    // Switch topic to Fruits
    const fruitBtn = page.getByRole('button', { name: /Trái cây/i })
    await fruitBtn.click()
    await expect(fruitBtn).toHaveClass(/bg-indigo-600/)

    // Click the first card
    const firstCard = page.getByRole('button', { name: /Thẻ úp/i }).first()
    await firstCard.click()

    // At least one card is now flipped face-up
    const faceUpCard = page.locator('button[aria-label*="Thẻ"]').first()
    await expect(faceUpCard).toBeVisible()

    // Back to home button works
    const backBtn = page.getByRole('link', { name: /Về trang chủ/i })
    await backBtn.click()
    await expect(page).toHaveURL('/')
  })

  test('supports teacher preview mode with custom settings', async ({ page }) => {
    const { encodePreviewSettings } = await import('../../src/lib/preview')
    const previewParam = encodePreviewSettings('memory-match', {
      topics: ['fruits'],
      pairCount: 4,
      autoSpeak: true,
      showTimer: false,
    })

    await page.goto(`/games/memory-match?preview=${previewParam}`)

    // Preview banner should be visible
    const previewBanner = page.getByRole('status', { name: /Chế độ xem trước/i })
    await expect(previewBanner).toBeVisible()

    // 4 pairs should be loaded (8 cards)
    const cards = page.getByRole('button', { name: /Thẻ úp/i })
    await expect(cards).toHaveCount(8)

    // Only 'Trái cây' should be available
    await expect(page.getByRole('button', { name: /Trái cây/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Động vật/i })).not.toBeVisible()
  })
})
