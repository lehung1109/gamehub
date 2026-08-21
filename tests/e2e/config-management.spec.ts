// tests/e2e/config-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Game Configuration Management (User Story 2)', () => {
  test('redirects unauthenticated user accessing /admin/configs/new to /login', async ({
    page,
  }) => {
    await page.goto('/admin/configs/new?gameId=flashcard')
    await expect(page).toHaveURL(/\/login\?redirect=.*admin.*configs.*new/)
  })

  test('redirects unauthenticated user accessing /admin/games/flashcard to /login', async ({
    page,
  }) => {
    await page.goto('/admin/games/flashcard')
    await expect(page).toHaveURL(/\/login\?redirect=.*admin.*games.*flashcard/)
  })
})
