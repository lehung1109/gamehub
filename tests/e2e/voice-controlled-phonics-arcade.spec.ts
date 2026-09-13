// tests/e2e/voice-controlled-phonics-arcade.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 21: Voice-Controlled Phonics Arcade & Speak-to-Play Games E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('navigates to voice arcade hub, plays Voice Jump Runner, triggers jumps, finishes stage and verifies strict typography', async ({
    page,
  }) => {
    // 1. Navigate from homepage topbar link
    await page.goto('/')
    const topbarLink = page.getByTestId('voice-arcade-topbar-link')
    await expect(topbarLink).toBeVisible()
    await topbarLink.click()

    await expect(page).toHaveURL(/\/games\/voice-arcade/)
    await expect(page.getByRole('heading', { name: /Khu Trò Chơi Giọng Nói/i })).toBeVisible()

    // 2. Test mode filtering
    const blasterFilterBtn = page.getByRole('button', { name: /bắn thiên thạch/i })
    await blasterFilterBtn.click()
    await expect(page.getByText(/Meteor Blaster: Blends & Digraphs/i)).toBeVisible()
    await expect(page.getByText(/Voice Jump Runner: CVC Words/i)).not.toBeVisible()

    // Switch back to all modes
    const allFilterBtn = page.getByRole('button', { name: /tất cả màn chơi/i })
    await allFilterBtn.click()
    await expect(page.getByText(/Voice Jump Runner: CVC Words/i)).toBeVisible()

    // 3. Launch Voice Jump Runner stage
    const playRunnerLink = page
      .locator('[data-testid="arcade-stage-card-runner-cvc"]')
      .getByRole('link', { name: /vào chơi ngay/i })
    await playRunnerLink.click()

    await expect(page).toHaveURL(/\/games\/voice-arcade\/runner-cvc/)
    await expect(page.getByText(/Voice Jump Runner: CVC Words/i)).toBeVisible()
    await expect(page.getByText('CAT', { exact: true })).toBeVisible()

    // 4. Trigger jump action via simulated pronunciation button
    const hitBtn = page.getByRole('button', { name: /phát âm đúng từ/i })
    await expect(hitBtn).toBeVisible()
    await hitBtn.click()

    // Feedback should show super jump
    await expect(page.getByText(/SUPER JUMP/i)).toBeVisible()

    // 5. Test skip button to advance word
    const skipBtn = page.getByRole('button', { name: /bỏ lỡ từ hiện tại/i })
    await expect(skipBtn).toBeVisible()
    await skipBtn.click()
    await expect(page.getByText('💨 CỐ LÊN NHÉ!')).toBeVisible()

    // 6. Strict Typography Audit (>= 16px) on game arena
    const gameHtml = await page.locator('main').innerHTML()
    expect(gameHtml).not.toContain('text-xs')
    expect(gameHtml).not.toContain('text-sm')
    expect(gameHtml).not.toContain('text-[10px]')
    expect(gameHtml).not.toContain('text-[12px]')
    expect(gameHtml).not.toContain('text-[14px]')
  })
})
