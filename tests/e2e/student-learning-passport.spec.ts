// tests/e2e/student-learning-passport.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 20: Student Learning Passport & Portfolio E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates to passport hub, views stamps and voice portfolio, opens graduation modal and passes typography audit', async ({
    page,
  }) => {
    // 1. Visit Passport Hub
    await page.goto('/passport')

    await expect(page.getByRole('heading', { name: 'Bé An Nhiên' })).toBeVisible()
    await expect(page.getByText('Hộ Chiếu Năng Lực Tiếng Anh')).toBeVisible()

    // 2. Verify Stamp Book & Voice Portfolio
    await expect(page.getByText('Sổ Dấu Ấn Hộ Chiếu (Passport Stamps)')).toBeVisible()
    await expect(page.getByText('Nhà Thám Hiểm Trò Chơi')).toBeVisible()
    await expect(page.getByText('Ca Sĩ Nhịp Điệu Phonics')).toBeVisible()

    await expect(page.getByText('Hồ Sơ Giọng Nói Nhí (Audio Portfolio)')).toBeVisible()
    await expect(page.getByText('Lồng tiếng: Chú Mèo Trong Rừng')).toBeVisible()

    // 3. Test Voice Recording Replay
    const playVoiceBtn = page.getByRole('button', { name: /nghe lại đoạn thu âm/i }).first()
    await expect(playVoiceBtn).toBeVisible()
    await playVoiceBtn.click()

    // 4. Test Digital Graduation Ceremony
    const gradBtn = page.getByRole('button', { name: /tổ chức lễ tốt nghiệp/i })
    await expect(gradBtn).toBeVisible()
    await gradBtn.click()

    await expect(
      page.getByRole('dialog', { name: /lễ tốt nghiệp trực tuyến và chứng chỉ/i })
    ).toBeVisible()
    await expect(page.getByText(/Chứng Nhận Hoàn Thành GameHub/i)).toBeVisible()
    await expect(page.getByText(/Trình Độ CEFR: Pre-A1/i)).toBeVisible()

    // Close modal
    const closeBtn = page.getByRole('button', { name: /đóng chứng chỉ/i })
    await closeBtn.click()
    await expect(
      page.getByRole('dialog', { name: /lễ tốt nghiệp trực tuyến và chứng chỉ/i })
    ).not.toBeVisible()

    // 5. Typography Audit
    const passportHtml = await page.content()
    expect(passportHtml).not.toContain('text-xs')
    expect(passportHtml).not.toContain('text-sm')
    expect(passportHtml).not.toContain('text-[10px]')
    expect(passportHtml).not.toContain('text-[12px]')
    expect(passportHtml).not.toContain('text-[14px]')
  })
})
