// tests/e2e/teacher-tools-import-community.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Teacher Tools - Vocabulary Importer & Community Marketplace (Phase 9 E2E)', () => {
  test.describe('Admin Route Protection & Authentication Redirects', () => {
    test('redirects unauthenticated user accessing /admin/community to /login', async ({ page }) => {
      await page.goto('/admin/community')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*community/)
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    })

    test('redirects unauthenticated user accessing /admin/word-bank to /login', async ({ page }) => {
      await page.goto('/admin/word-bank')
      await expect(page).toHaveURL(/\/login\?redirect=.*admin.*word-bank/)
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    })
  })

  test.describe('Login Screen Entry Point for Teachers', () => {
    test('displays login form with email and password inputs', async ({ page }) => {
      await page.goto('/login')
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/mật khẩu/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible()
    })
  })
})
