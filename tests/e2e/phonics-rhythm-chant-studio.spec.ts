// tests/e2e/phonics-rhythm-chant-studio.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 18: Phonics Rhythm Chant & Karaoke Studio E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates to chants catalog, opens a chant studio, interacts with rhythm controls and passes typography audit', async ({
    page,
  }) => {
    // 1. Visit Chants Catalog
    await page.goto('/chants')

    await expect(
      page.getByRole('heading', { name: /phòng thu vè phonics & karaoke nhịp điệu/i })
    ).toBeVisible()

    await expect(page.getByText('Chú Mèo Trên Tấm Thảm')).toBeVisible()

    // Typography audit on catalog
    const catalogHtml = await page.content()
    expect(catalogHtml).not.toContain('text-xs')
    expect(catalogHtml).not.toContain('text-sm')
    expect(catalogHtml).not.toContain('text-[10px]')
    expect(catalogHtml).not.toContain('text-[12px]')
    expect(catalogHtml).not.toContain('text-[14px]')

    // 2. Open first chant studio
    const startChantBtn = page.getByRole('link', { name: /bắt đầu hát vè/i }).first()
    await startChantBtn.click()

    await expect(page).toHaveURL('/chants/cat-on-the-mat')

    // 3. Verify studio controls
    await expect(page.getByText(/Tiết tấu: 96 BPM/i)).toBeVisible()
    await expect(page.getByText('Một chú mèo, một chú mèo mập mạp!')).toBeVisible()

    const playBtn = page.getByRole('button', { name: /phát nhịp điệu/i })
    await expect(playBtn).toBeVisible()

    const tapBtn = page.getByRole('button', { name: /vỗ tay gõ nhịp điệu/i })
    await expect(tapBtn).toBeVisible()

    const micBtn = page.getByRole('button', { name: /thu âm/i })
    await expect(micBtn).toBeVisible()

    // 4. Test interaction
    await playBtn.click()
    await expect(page.getByRole('button', { name: /tạm dừng/i })).toBeVisible()

    await tapBtn.click()
    await expect(page.getByText(/Combo: 1x/i)).toBeVisible()

    // 5. Typography audit on live studio
    const studioHtml = await page.content()
    expect(studioHtml).not.toContain('text-xs')
    expect(studioHtml).not.toContain('text-sm')
    expect(studioHtml).not.toContain('text-[10px]')
    expect(studioHtml).not.toContain('text-[12px]')
    expect(studioHtml).not.toContain('text-[14px]')
  })
})
