// tests/e2e/preview-config.spec.ts
import { test, expect } from '@playwright/test'
import { encodePreviewSettings } from '../../src/lib/preview'

test.describe('Preview Game Configuration (E2E)', () => {
  test.describe('Preview URL Direct Launch & Game Rendering', () => {
    test('Flashcard game applies preview topics from URL-safe preview query param', async ({ page }) => {
      const previewParam = encodePreviewSettings('flashcard', {
        topics: ['animals'],
        wordLimit: 5,
        autoSpeak: false,
      })

      await page.goto(`/games/flashcard?preview=${previewParam}`)
      await expect(page.getByRole('heading', { level: 1, name: /Học từ vựng qua Flashcard/i })).toBeVisible()

      // In flashcard with preview topics=['animals'], only Animals should be displayed
      await expect(page.getByRole('link', { name: /Động vật/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /Trường học/i })).not.toBeVisible()
      await expect(page.getByRole('link', { name: /Gia đình/i })).not.toBeVisible()
    })

    test('Alphabet game renders restricted letter range from preview query param', async ({ page }) => {
      const previewParam = encodePreviewSettings('alphabet', {
        letterRange: ['A', 'B', 'C'],
        mode: 'learn',
        autoSpeak: false,
      })

      await page.goto(`/games/alphabet?preview=${previewParam}`)
      await expect(page.getByRole('heading', { level: 1, name: /Chữ cái & Phonics/i })).toBeVisible()

      // Header should display letter count for restricted letter range (3 letters)
      await expect(page.getByText('Bảng chữ cái (3 chữ)')).toBeVisible()
    })

    test('Listening game applies preview settings correctly', async ({ page }) => {
      const previewParam = encodePreviewSettings('listening', {
        topics: ['fruits'],
        questionCount: 5,
        showHint: true,
      })

      await page.goto(`/games/listening?preview=${previewParam}`)
      await expect(page.getByRole('heading', { level: 1, name: /Nghe hiểu/i })).toBeVisible()
      // Only Trái cây topic filter should be active/present
      await expect(page.getByRole('button', { name: /Trái cây/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Động vật/i })).not.toBeVisible()
    })

    test('Malformed preview parameter gracefully falls back to default settings without crashing', async ({ page }) => {
      await page.goto('/games/flashcard?preview=invalid_malformed_base64_payload')
      await expect(page.getByRole('heading', { level: 1, name: /Học từ vựng qua Flashcard/i })).toBeVisible()

      // Should show all default topics
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

      // All 26 letters should still be present
      await expect(page.getByText('Bảng chữ cái (26 chữ)')).toBeVisible()
    })
  })

  test.describe('US1: Preview New Config Before Saving', () => {
    test('admin can preview new game configuration directly via preview query parameter', async ({ page }) => {
      // Simulate creating a new flashcard configuration with specific topic and word limit
      const previewPayload = encodePreviewSettings('flashcard', {
        topics: ['fruits'],
        wordLimit: 3,
        autoSpeak: true,
      })

      await page.goto(`/games/flashcard?preview=${previewPayload}`)
      await expect(page.getByRole('heading', { level: 1, name: /Học từ vựng qua Flashcard/i })).toBeVisible()

      // Only Trái cây topic is shown
      await expect(page.getByRole('link', { name: /Trái cây/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /Động vật/i })).not.toBeVisible()
    })

    test('admin can preview spelling game configuration with customized topics', async ({ page }) => {
      const previewPayload = encodePreviewSettings('spelling', {
        topics: ['school'],
        wordLimit: 4,
        showEmoji: true,
      })

      await page.goto(`/games/spelling?preview=${previewPayload}`)
      await expect(page.getByRole('heading', { level: 1, name: /Đánh vần & Ghép từ/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Trường học/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Động vật/i })).not.toBeVisible()
    })
  })

  test.describe('US2: Preview Edited Config Before Saving Changes (UI Placeholders for Future Phase)', () => {
    test.skip('admin can preview modified settings from edit form without saving', async () => {
      // Will be enabled when Phase 4 (US2 ConfigEditForm integration) is implemented
    })
  })

  test.describe('US4: Settings Validation Before Preview (UI Placeholders for Future Phase)', () => {
    test.skip('blocks preview and displays validation error when settings are invalid', async () => {
      // Will be enabled when Phase 5 (US4 Validation in PreviewButton) is implemented
    })
  })

  test.describe('US3: Visual Distinction in Preview Mode (UI Placeholders for Future Phase)', () => {
    test.skip('displays amber preview mode banner on game page when in preview mode', async () => {
      // Will be enabled when Phase 6 (US3 PreviewBanner) is implemented
    })
  })
})
