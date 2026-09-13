// tests/e2e/interactive-comic-storybooks.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 17: Interactive Phonics Comic Storybooks E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates to stories catalog, opens a story, and verifies reader controls and strict typography', async ({
    page,
  }) => {
    // 1. Visit Stories Catalog
    await page.goto('/stories')

    await expect(
      page.getByRole('heading', { name: /thế giới truyện tranh tương tác/i })
    ).toBeVisible()

    await expect(page.getByText('Chú Mèo Lạc Trong Rừng Thì Thầm')).toBeVisible()

    // Typography audit on catalog
    const catalogHtml = await page.content()
    expect(catalogHtml).not.toContain('text-xs')
    expect(catalogHtml).not.toContain('text-sm')
    expect(catalogHtml).not.toContain('text-[10px]')
    expect(catalogHtml).not.toContain('text-[12px]')
    expect(catalogHtml).not.toContain('text-[14px]')

    // 2. Open first story
    const readBtn = page.getByRole('link', { name: /đọc & lồng tiếng ngay/i }).first()
    await readBtn.click()

    await expect(page).toHaveURL('/stories/the-lost-kitten')

    // 3. Verify comic reader contents
    await expect(page.getByRole('heading', { name: 'Miu Miu' })).toBeVisible()
    await expect(page.getByText(/I see a big cat./i).first()).toBeVisible()
    await expect(page.getByText('MEOW!')).toBeVisible()

    const listenBtn = page.getByRole('button', { name: /nghe.*mẫu/i })
    await expect(listenBtn).toBeVisible()

    const voiceBtn = page.getByRole('button', { name: /bắt đầu lồng tiếng/i })
    await expect(voiceBtn).toBeVisible()

    // Typography audit on reader
    const readerHtml = await page.content()
    expect(readerHtml).not.toContain('text-xs')
    expect(readerHtml).not.toContain('text-sm')
    expect(readerHtml).not.toContain('text-[10px]')
    expect(readerHtml).not.toContain('text-[12px]')
    expect(readerHtml).not.toContain('text-[14px]')
  })
})
