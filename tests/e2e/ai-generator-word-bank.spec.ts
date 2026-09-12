// tests/e2e/ai-generator-word-bank.spec.ts

import { test, expect } from '@playwright/test'

test.describe('AI Content Generator & Centralized Word Bank E2E', () => {
  test.describe('Route Protection & Authentication Redirects', () => {
    test('redirects unauthenticated user accessing /admin/word-bank to /login', async ({
      page,
    }) => {
      await page.goto('/admin/word-bank')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*word-bank/)
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    })

    test('redirects unauthenticated user accessing /admin/ai-generator to /login', async ({
      page,
    }) => {
      await page.goto('/admin/ai-generator')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*ai-generator/)
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    })
  })
})
