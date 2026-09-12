import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Student PvP Duels & Leaderboards E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('Homepage navigation: renders ⚔️ Đấu trường 1v1 link and navigates to /duel', async ({
    page,
  }) => {
    await page.goto('/')

    const duelLink = page
      .getByRole('link', { name: /Đấu trường 1v1/i })
      .first()
    await expect(duelLink).toBeVisible()
    await duelLink.click()

    await expect(page).toHaveURL(/\/duel/)
    await expect(page.locator('[data-testid="duel-hub"]')).toBeVisible()
  })

  test('Duel Hub UI: displays main hub and action buttons', async ({ page }) => {
    await page.goto('/duel')

    await expect(page.locator('[data-testid="duel-hub"]')).toBeVisible()
    await expect(page.locator('[data-testid="open-create-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="open-join-modal"]')).toBeVisible()
  })

  test('Create Duel Room flow: opens create modal, fills name, submits and enters waiting room', async ({
    page,
  }) => {
    await page.goto('/duel')

    // Open create modal
    const openCreateBtn = page.locator('[data-testid="open-create-modal"]')
    await openCreateBtn.click()

    const createModal = page.locator('[data-testid="create-duel-modal"]')
    await expect(createModal).toBeVisible()

    // Type student player name
    const playerNameInput = page.locator('[data-testid="player-name-input"]')
    await expect(playerNameInput).toBeVisible()
    await playerNameInput.fill('Bé Rồng Vàng')

    // Submit form
    const submitBtn = page.locator('[data-testid="create-duel-submit"]')
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    // Expect navigation to /duel/[code]
    await expect(page).toHaveURL(/\/duel\/[A-Z0-9]{6}/, { timeout: 15000 })

    // Verify waiting room lobby renders with room code
    const waitingRoom = page.locator('[data-testid="duel-waiting-room"]')
    await expect(waitingRoom).toBeVisible({ timeout: 15000 })

    const currentUrl = page.url()
    const match = currentUrl.match(/\/duel\/([A-Z0-9]{6})/)
    expect(match).not.toBeNull()
    const roomCode = match![1]

    await expect(waitingRoom).toContainText(roomCode)
  })

  test('Join Duel Modal validation & interactions: validates uppercase room code and closes modal', async ({
    page,
  }) => {
    await page.goto('/duel')

    // Open join modal
    const openJoinBtn = page.locator('[data-testid="open-join-modal"]')
    await openJoinBtn.click()

    const joinModal = page.locator('[data-testid="join-duel-modal"]')
    await expect(joinModal).toBeVisible()

    // Test typing into room-code-input (auto uppercase)
    const roomCodeInput = page.locator('[data-testid="room-code-input"]')
    await expect(roomCodeInput).toBeVisible()
    await roomCodeInput.fill('abcxyz')
    await expect(roomCodeInput).toHaveValue('ABCXYZ')

    // Test typing player name
    const joinNameInput = page.locator('[data-testid="join-player-name-input"]')
    await expect(joinNameInput).toBeVisible()
    await joinNameInput.fill('Dũng Sĩ Tí Hon')
    await expect(joinNameInput).toHaveValue('Dũng Sĩ Tí Hon')

    // Close modal
    const closeBtn = joinModal.getByRole('button', { name: 'Đóng' })
    await closeBtn.click()
    await expect(joinModal).not.toBeVisible()
  })

  test('Leaderboards Hub navigation & switching: switches between class and global views with timeframe filters', async ({
    page,
  }) => {
    await page.goto('/leaderboard')

    // Verify hub container
    const hub = page.locator('[data-testid="leaderboard-hub"]')
    await expect(hub).toBeVisible()

    // Verify tabs
    const classTab = page.locator('[data-testid="tab-class-leaderboard"]')
    const globalTab = page.locator('[data-testid="tab-global-leaderboard"]')
    await expect(classTab).toBeVisible()
    await expect(globalTab).toBeVisible()

    // Switch to global leaderboard tab
    await globalTab.click()
    const globalTable = page.locator('[data-testid="global-leaderboard-table"]')
    await expect(globalTable).toBeVisible()

    // Verify timeframe toggles
    const weeklyToggle = page.locator('[data-testid="timeframe-weekly"]')
    const allToggle = page.locator('[data-testid="timeframe-all"]')
    await expect(weeklyToggle).toBeVisible()
    await expect(allToggle).toBeVisible()

    // Switch to all-time timeframe
    await allToggle.click()
    await expect(allToggle).toHaveClass(/bg-card/)

    // Switch back to weekly
    await weeklyToggle.click()
    await expect(weeklyToggle).toHaveClass(/bg-card/)

    // Switch back to classroom leaderboard tab
    await classTab.click()
    const classCodeInput = page.locator('[data-testid="class-code-input"]')
    await expect(classCodeInput).toBeVisible()
  })
})
