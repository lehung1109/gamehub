// tests/e2e/student-learning-guilds.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 19: Student Learning Guilds E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates to guilds hub, opens guild details, interacts with boss raid and cheer wall, and passes typography audit', async ({
    page,
  }) => {
    // 1. Visit Guilds Hub
    await page.goto('/guilds')

    await expect(
      page.getByRole('heading', { name: /đại sảnh bang hội học tập/i })
    ).toBeVisible()

    await expect(page.getByText('Hiệp Sĩ Rồng Lửa')).toBeVisible()
    await expect(page.getByText('Biệt Đội Cú Thông Thái')).toBeVisible()

    // Typography audit on Hub
    const hubHtml = await page.content()
    expect(hubHtml).not.toContain('text-xs')
    expect(hubHtml).not.toContain('text-sm')
    expect(hubHtml).not.toContain('text-[10px]')
    expect(hubHtml).not.toContain('text-[12px]')
    expect(hubHtml).not.toContain('text-[14px]')

    // 2. Open first guild headquarters
    const viewGuildBtn = page.getByRole('link', { name: /vào trụ sở bang/i }).first()
    await viewGuildBtn.click()

    await expect(page).toHaveURL('/guilds/fire-dragons')

    // 3. Verify Guild Detail contents
    await expect(page.getByRole('heading', { name: 'Hiệp Sĩ Rồng Lửa' })).toBeVisible()
    await expect(page.getByText('Mã Bang: DRAGON-99')).toBeVisible()
    await expect(page.getByText('Rồng Từ Vựng Khổng Lồ')).toBeVisible()

    const attackBtn = page.getByRole('button', { name: /tấn công boss/i })
    await expect(attackBtn).toBeVisible()

    // 4. Test attacking boss
    await attackBtn.click()
    await expect(page.getByText('-50 HP!')).toBeVisible()

    // 5. Test sending cheer
    const quickCheerBtn = page.getByRole('button', { name: /gửi cổ vũ cố lên các bạn ơi/i })
    await expect(quickCheerBtn).toBeVisible()
    await quickCheerBtn.click()

    await expect(page.getByText(/cùng săn Boss nào/i).first()).toBeVisible()

    // 6. Typography audit on Guild Details
    const detailHtml = await page.content()
    expect(detailHtml).not.toContain('text-xs')
    expect(detailHtml).not.toContain('text-sm')
    expect(detailHtml).not.toContain('text-[10px]')
    expect(detailHtml).not.toContain('text-[12px]')
    expect(detailHtml).not.toContain('text-[14px]')
  })
})
