// tests/e2e/config-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Game Configuration Management (User Story 2 & 3)', () => {
  test.describe('Route Protection & Authentication Redirects', () => {
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

    test('redirects unauthenticated user accessing /admin/configs/edit route to /login', async ({
      page,
    }) => {
      await page.goto('/admin/configs/cfg-sample-123')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*configs.*cfg-sample-123/)
    })

    test('redirects unauthenticated user accessing /admin/account to /login', async ({
      page,
    }) => {
      await page.goto('/admin/account')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*account/)
    })
  })

  test.describe('Public Accessibility & Fallback Behavior', () => {
    test('public user can access all games without authentication', async ({ page }) => {
      await page.goto('/games/flashcard')
      await expect(page).toHaveURL('/games/flashcard')
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      await page.goto('/games/alphabet')
      await expect(page).toHaveURL('/games/alphabet')
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    })
  })
})
