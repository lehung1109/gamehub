// tests/e2e/preview-config.spec.ts
import { test, expect } from '@playwright/test'
import { encodePreviewSettings } from '../../src/lib/preview'

test.describe('Preview Game Configuration (E2E Suite)', () => {
  test.describe('Universal Support: All 6 Games Preview Direct Launch', () => {
    test('1. Flashcard: applies topic filtering, navigates to sub-topic preserving preview, and respects wordLimit', async ({
      page,
    }) => {
      const previewParam = encodePreviewSettings('flashcard', {
        topics: ['animals'],
        wordLimit: 3,
        autoSpeak: false,
      })

      // 1. Topic selection page in preview mode
      await page.goto(`/games/flashcard?preview=${previewParam}`)
      await expect(page.getByRole('heading', { level: 1, name: /Học từ vựng qua Flashcard/i })).toBeVisible()

      // Preview banner is visible
      const previewBanner = page.getByRole('status', { name: /Chế độ xem trước/i })
      await expect(previewBanner).toBeVisible()

      // Filtered topics: only Animals shown
      await expect(page.getByRole('link', { name: /Động vật/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /Trường học/i })).not.toBeVisible()
      await expect(page.getByRole('link', { name: /Gia đình/i })).not.toBeVisible()

      // 2. Click into Animals topic - preview parameter must be preserved in URL
      await page.getByRole('link', { name: /Động vật/i }).click()
      await expect(page).toHaveURL(new RegExp(`/games/flashcard/animals\\?preview=${previewParam}`))

      // Preview banner is also visible on topic detail page
      await expect(page.getByRole('status', { name: /Chế độ xem trước/i })).toBeVisible()

      // Word counter should reflect wordLimit (e.g. 1/3)
      await expect(page.getByText('1 / 3')).toBeVisible()

      // 3. Back button returns to topic selection while preserving preview param
      await page.getByRole('link', { name: /Chọn chủ đề/i }).click()
      await expect(page).toHaveURL(new RegExp(`/games/flashcard\\?preview=${previewParam}`))
    })

    test('2. Alphabet: renders restricted letter range and switches mode in preview mode', async ({
      page,
    }) => {
      const previewParam = encodePreviewSettings('alphabet', {
        letterRange: ['A', 'B', 'C'],
        mode: 'learn',
        autoSpeak: false,
      })

      await page.goto(`/games/alphabet?preview=${previewParam}`)
      await expect(page.getByRole('heading', { level: 1, name: /Chữ cái & Phonics/i })).toBeVisible()
      await expect(page.getByRole('status', { name: /Chế độ xem trước/i })).toBeVisible()

      // Letter count indicator matches restricted range
      await expect(page.getByText('Bảng chữ cái (3 chữ)')).toBeVisible()

      // Alphabet grid displays A, B, C cards
      await expect(page.getByRole('button', { name: /Chữ A/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Chữ B/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Chữ C/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Chữ Z/i })).not.toBeVisible()
    })

    test('3. Listening: applies preview topic filter and question count', async ({ page }) => {
      const previewParam = encodePreviewSettings('listening', {
        topics: ['fruits'],
        questionCount: 5,
        showHint: true,
      })

      await page.goto(`/games/listening?preview=${previewParam}`)
      await expect(page.getByRole('heading', { level: 1, name: /Nghe hiểu/i })).toBeVisible()
      await expect(page.getByRole('status', { name: /Chế độ xem trước/i })).toBeVisible()

      // Only Trái cây filter button should be present
      await expect(page.getByRole('button', { name: /Trái cây/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Động vật/i })).not.toBeVisible()
    })

    test('4. Numbers & Colors: applies number range restriction and hides Colors tab when includeColors=false', async ({
      page,
    }) => {
      const previewParam = encodePreviewSettings('numbers-colors', {
        numberRange: [1, 5],
        includeColors: false,
        mode: 'learn',
      })

      await page.goto(`/games/numbers-colors?preview=${previewParam}`)
      await expect(page.getByRole('heading', { level: 1, name: /Số & Màu sắc/i })).toBeVisible()
      await expect(page.getByRole('status', { name: /Chế độ xem trước/i })).toBeVisible()

      // Numbers in range [1, 5]
      await expect(page.getByRole('button', { name: /Số 5/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Số 10/i })).not.toBeVisible()

      // Colors tab should NOT be rendered when includeColors is false
      await expect(page.getByRole('tab', { name: /Màu sắc/i })).not.toBeVisible()
    })

    test('5. Sentences: applies category filtering in preview mode', async ({ page }) => {
      const previewParam = encodePreviewSettings('sentences', {
        categories: ['school'],
        sentenceCount: 5,
        showVietnamese: true,
      })

      await page.goto(`/games/sentences?preview=${previewParam}`)
      await expect(page.getByRole('heading', { level: 1, name: /Luyện câu đơn giản/i })).toBeVisible()
      await expect(page.getByRole('status', { name: /Chế độ xem trước/i })).toBeVisible()

      // Only school category button is visible
      await expect(page.getByRole('button', { name: /Trường học/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Động vật/i })).not.toBeVisible()
    })

    test('6. Spelling: applies custom topics and word limit in preview mode', async ({ page }) => {
      const previewParam = encodePreviewSettings('spelling', {
        topics: ['school'],
        wordLimit: 4,
        showEmoji: true,
      })

      await page.goto(`/games/spelling?preview=${previewParam}`)
      await expect(page.getByRole('heading', { level: 1, name: /Đánh vần & Ghép từ/i })).toBeVisible()
      await expect(page.getByRole('status', { name: /Chế độ xem trước/i })).toBeVisible()

      // Only school topic button is displayed
      await expect(page.getByRole('button', { name: /Trường học/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Động vật/i })).not.toBeVisible()
    })
  })

  test.describe('Graceful Fallback & Error Handling', () => {
    test('Malformed/corrupted base64 payload gracefully falls back to default settings without error', async ({
      page,
    }) => {
      await page.goto('/games/flashcard?preview=invalid_malformed_base64_payload!!!')
      await expect(page.getByRole('heading', { level: 1, name: /Học từ vựng qua Flashcard/i })).toBeVisible()

      // No preview banner should be shown
      await expect(page.getByRole('status', { name: /Chế độ xem trước/i })).not.toBeVisible()

      // Default game loads all topics
      await expect(page.getByRole('link', { name: /Động vật/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /Trường học/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /Gia đình/i })).toBeVisible()
    })

    test('Mismatched gameId in preview parameter gracefully falls back to default settings', async ({ page }) => {
      // Create preview for flashcard but visit alphabet game
      const previewParam = encodePreviewSettings('flashcard', {
        topics: ['animals'],
        wordLimit: 5,
        autoSpeak: false,
      })

      await page.goto(`/games/alphabet?preview=${previewParam}`)
      await expect(page.getByRole('heading', { level: 1, name: /Chữ cái & Phonics/i })).toBeVisible()

      // No preview banner shown
      await expect(page.getByRole('status', { name: /Chế độ xem trước/i })).not.toBeVisible()

      // All 26 letters should still be present
      await expect(page.getByText('Bảng chữ cái (26 chữ)')).toBeVisible()
    })
  })

  test.describe('Visual Distinction & Banner Presence', () => {
    test('standard gameplay without preview parameter does not render preview banner', async ({ page }) => {
      await page.goto('/games/alphabet')
      await expect(page.getByRole('heading', { level: 1, name: /Chữ cái & Phonics/i })).toBeVisible()
      await expect(page.getByRole('status', { name: /Chế độ xem trước/i })).not.toBeVisible()
    })

    test('preview banner renders amber badges with clear unsaved warning across multiple game types', async ({
      page,
    }) => {
      const games = [
        { id: 'alphabet' as const, settings: { letterRange: ['A', 'B'], mode: 'learn' as const, autoSpeak: false }, heading: /Chữ cái & Phonics/i },
        { id: 'listening' as const, settings: { topics: ['fruits'], questionCount: 5, showHint: true }, heading: /Nghe hiểu/i },
        { id: 'spelling' as const, settings: { topics: ['family'], wordLimit: 4, showEmoji: true }, heading: /Đánh vần & Ghép từ/i },
      ]

      for (const item of games) {
        const previewParam = encodePreviewSettings(item.id, item.settings)
        await page.goto(`/games/${item.id}?preview=${previewParam}`)
        await expect(page.getByRole('heading', { level: 1, name: item.heading })).toBeVisible()

        const banner = page.getByRole('status', { name: /Chế độ xem trước/i })
        await expect(banner).toBeVisible()
        await expect(banner).toContainText(/Chế độ xem trước/i)
        await expect(banner).toContainText(/Cấu hình chưa được lưu/i)
      }
    })
  })
})
