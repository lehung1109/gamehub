// tests/e2e/phonics-mystery-escape-room.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 24: Phonics Mystery Escape Room & Detective Quest E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates from homepage, investigates clue hotspot, enters cipher code, escapes room, and verifies strict typography', async ({
    page,
  }) => {
    // 1. Navigate from homepage topbar link
    await page.goto('/')
    const topbarLink = page.getByTestId('escape-room-topbar-link')
    await expect(topbarLink).toBeVisible()
    await topbarLink.click()

    await expect(page).toHaveURL(/\/escape-room/)
    await expect(
      page.getByRole('heading', { name: /Phòng Thoát Hiểm Bí Mật/i })
    ).toBeVisible()

    // 2. Verify all 3 curated rooms are listed
    await expect(page.getByText('Lăng Mộ Pharaoh Bí Ẩn', { exact: true })).toBeVisible()
    await expect(page.getByText('Thư Viện Ma Thuật Đêm Khuya', { exact: true })).toBeVisible()
    await expect(page.getByText('Trạm Không Gian Bị Khóa', { exact: true })).toBeVisible()

    // 3. Test difficulty filters
    const libraryFilterBtn = page.getByRole('button', { name: /Thám Tử/i })
    await expect(libraryFilterBtn).toBeVisible()
    await libraryFilterBtn.click()

    await expect(page.getByText('Thư Viện Ma Thuật Đêm Khuya', { exact: true })).toBeVisible()
    await expect(page.getByText('Lăng Mộ Pharaoh Bí Ẩn', { exact: true })).not.toBeVisible()

    const allFilterBtn = page.getByRole('button', { name: /Tất Cả Phòng/i })
    await allFilterBtn.click()
    await expect(page.getByText('Lăng Mộ Pharaoh Bí Ẩn', { exact: true })).toBeVisible()

    // 4. Enter Pharaoh's Tomb
    const tombCard = page.locator('[data-testid="escape-room-card-pharaoh-tomb"]')
    const playTombLink = tombCard.getByRole('link', { name: /vào điều tra ngay/i })
    await playTombLink.click()

    await expect(page).toHaveURL(/\/escape-room\/pharaoh-tomb/)
    await expect(page.getByRole('heading', { name: 'Lăng Mộ Pharaoh Bí Ẩn' })).toBeVisible()
    await expect(page.getByText('CỬA THOÁT HIỂM')).toBeVisible()

    // 5. Inspect Clue Hotspot 1 (Bức Họa Cổ Đại)
    const hsBtn = page.getByRole('button', { name: /khám phá manh mối bức họa cổ đại/i })
    await expect(hsBtn).toBeVisible()
    await hsBtn.click()

    const clueModal = page.getByRole('dialog', {
      name: /khám phá manh mối thám tử/i,
    })
    await expect(clueModal).toBeVisible()

    // Select option SHELL
    const shellBtn = page.getByRole('button', { name: /shell/i })
    await expect(shellBtn).toBeVisible()
    await shellBtn.click()

    // Verify feedback
    await expect(page.getByText(/Ký tự bí mật nhận được:/i)).toBeVisible()
    await expect(clueModal).not.toBeVisible({ timeout: 5000 })

    // Verify clue collected in notebook
    await expect(page.getByText('1/4')).toBeVisible()

    // 6. Open Vault Door Cipher Keypad
    const doorBtn = page.getByRole('button', { name: /mở ổ khóa mật mã cửa chính/i })
    await expect(doorBtn).toBeVisible()
    await doorBtn.click()

    const keypadModal = page.getByRole('dialog', {
      name: /ổ khóa mật mã cửa thoát hiểm/i,
    })
    await expect(keypadModal).toBeVisible()

    // Enter SHIP
    await page.getByRole('button', { name: 'Ký tự S' }).click()
    await page.getByRole('button', { name: 'Ký tự H' }).click()
    await page.getByRole('button', { name: 'Ký tự I' }).click()
    await page.getByRole('button', { name: 'Ký tự P' }).click()

    // Verify unlock message
    await expect(page.getByText(/MẬT MÃ CHÍNH XÁC/i)).toBeVisible()

    // 7. Verify Certificate Modal appears
    const certModal = page.getByRole('dialog', {
      name: /chứng chỉ thám tử thoát hiểm xuất sắc/i,
    })
    await expect(certModal).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('THOÁT HIỂM THÀNH CÔNG!')).toBeVisible()

    // 8. Strict Typography Audit (>= 16px) on main route container
    const roomHtml = await page.locator('main').innerHTML()
    expect(roomHtml).not.toContain('text-xs')
    expect(roomHtml).not.toContain('text-sm')
    expect(roomHtml).not.toContain('text-[10px]')
    expect(roomHtml).not.toContain('text-[12px]')
    expect(roomHtml).not.toContain('text-[14px]')
  })
})
