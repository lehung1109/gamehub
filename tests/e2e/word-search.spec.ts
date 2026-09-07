import { test, expect } from '@playwright/test'

test.describe('Word Search Game E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'gamehub_student_session',
        JSON.stringify({ isAnonymous: true })
      )
    })
  })

  test('navigates from homepage to word search game', async ({ page }) => {
    await page.goto('/')

    const wordSearchLink = page.getByRole('link', { name: /Săn tìm từ vựng/i })
    await expect(wordSearchLink).toBeVisible()

    await wordSearchLink.click()
    await expect(page).toHaveURL(/\/games\/word-search/)
    await expect(page.locator('h1')).toContainText('Săn tìm từ vựng (Word Search)')
  })

  test('renders 8x8 matrix board with 64 accessible cells and target words list', async ({ page }) => {
    await page.goto('/games/word-search')

    // Verify 64 cells in the 8x8 grid
    const cells = page.getByRole('gridcell')
    await expect(cells).toHaveCount(64)

    // Verify target word sidebar exists
    const wordListHeader = page.getByRole('heading', { name: /Từ vựng cần tìm/i }).first()
    await expect(wordListHeader).toBeVisible()
  })

  test('toggles hint and increments hint counter', async ({ page }) => {
    await page.goto('/games/word-search')

    const hintButton = page.getByRole('button', { name: /Gợi ý/i })
    await expect(hintButton).toBeVisible()

    // Click hint button
    await hintButton.click()

    // Hint count badge appears with '1' inside the hint button
    await expect(hintButton.getByText('1', { exact: true })).toBeVisible()

    // At least one cell pulses with animate-pulse
    const pulsingCell = page.locator('.animate-pulse')
    await expect(pulsingCell.first()).toBeVisible()
  })

  test('toggles topic and target word counts via collapsible selector', async ({ page }) => {
    await page.goto('/games/word-search')

    // Open topic/count selector
    const toggleSelectorBtn = page.getByRole('button', { name: /Đổi chủ đề & số từ/i })
    await toggleSelectorBtn.click()

    // Switch word count to 4 words
    const btn4Words = page.getByRole('button', { name: '4 từ' })
    await expect(btn4Words).toBeVisible()
    await btn4Words.click()

    // Switch topic to Fruits ("Trái cây")
    const fruitTopicBtn = page.getByRole('button', { name: /Trái cây/i })
    await fruitTopicBtn.click()

    // Verify topic badge in header updated
    await expect(page.locator('h1').locator('..').getByText('Trái cây')).toBeVisible()
  })

  test('supports teacher preview mode with custom settings', async ({ page }) => {
    const { encodePreviewSettings } = await import('../../src/lib/preview')
    const previewParam = encodePreviewSettings('word-search', {
      topics: ['fruits'],
      wordCount: 4,
      enableHints: true,
      autoSpeak: true,
      showTimer: false,
    })

    await page.goto(`/games/word-search?preview=${previewParam}`)

    // Preview banner should be visible
    const previewBanner = page.getByRole('status', { name: /Chế độ xem trước/i })
    await expect(previewBanner).toBeVisible()

    // 8x8 grid of 64 cells is rendered
    const cells = page.getByRole('gridcell')
    await expect(cells).toHaveCount(64)

    // Verify 4 target words are displayed
    const wordItems = page.locator('[data-testid^="target-word-"]')
    await expect(wordItems).toHaveCount(4)
  })

  test('allows dragging with mouse across cells to select a word on PC', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/games/word-search')

    const cell00 = page.getByTestId('cell-r0-c0')
    const cell01 = page.getByTestId('cell-r0-c1')
    const cell02 = page.getByTestId('cell-r0-c2')

    await expect(cell00).toBeVisible()
    await cell00.hover()
    await page.mouse.down()
    await cell01.hover()
    await cell02.hover()

    // Check if cell00, cell01, cell02 are highlighted while mouse is down
    await expect(cell00).toHaveClass(/bg-amber-300/)
    await expect(cell01).toHaveClass(/bg-amber-300/)
    await expect(cell02).toHaveClass(/bg-amber-300/)

    await page.mouse.up()

    const criticalErrors = errors.filter(
      (e) => !e.includes('Hydration failed') && !e.includes('hydration')
    )
    expect(criticalErrors).toEqual([])
  })
})
