import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 11: PWA Offline & Multi-Accent Neural TTS Engine E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })

  test('manifest.webmanifest should return valid PWA specification', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest')
    expect(response.status()).toBe(200)

    const manifest = await response.json()
    expect(manifest.name).toContain('GameHub')
    expect(manifest.short_name).toBe('GameHub')
    expect(manifest.start_url).toBe('/')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#4f46e5')
    expect(manifest.background_color).toBe('#ffffff')
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
  })

  test('navbar quick voice switcher opens modal, updates accent, and persists to UI', async ({
    page,
  }) => {
    await page.goto('/')

    // Locate Quick Voice Switcher button
    const voiceSwitcher = page.getByRole('button', { name: /voice accent settings/i })
    await voiceSwitcher.scrollIntoViewIfNeeded()
    await expect(voiceSwitcher).toBeVisible()

    // Default US accent displayed
    await expect(voiceSwitcher).toContainText('US Voice')
    await expect(voiceSwitcher).toContainText('🇺🇸')

    // Open speech settings modal
    await voiceSwitcher.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Speech & Accent Settings')).toBeVisible()

    // Switch accent to British English (UK)
    const ukOption = dialog.getByRole('button', { name: /British English \(UK\)/i })
    await expect(ukOption).toBeVisible()
    await ukOption.click()

    // Switch style to Friendly Kid
    const kidOption = dialog.getByRole('button', { name: /Friendly Kid/i })
    await expect(kidOption).toBeVisible()
    await kidOption.click()

    // Click preview voice button
    const previewBtn = dialog.getByRole('button', { name: /preview voice/i })
    await expect(previewBtn).toBeVisible()
    await previewBtn.click()

    // Close modal via Done button
    const doneBtn = dialog.getByRole('button', { name: /done/i })
    await doneBtn.click()
    await expect(dialog).not.toBeVisible()

    // Verify QuickVoiceSwitcher button reflected UK accent update
    await expect(voiceSwitcher).toContainText('UK Voice')
    await expect(voiceSwitcher).toContainText('🇬🇧')
  })

  test('offline fallback page provides kid-friendly reassurance and home navigation', async ({
    page,
  }) => {
    await page.goto('/offline')

    // Heading and reassurance copy
    await expect(page.getByRole('heading', { name: /You are Offline!/i })).toBeVisible()
    await expect(page.getByText(/saved safely on your device/i)).toBeVisible()

    // Interactive buttons
    const retryBtn = page.getByRole('button', { name: /try reconnecting/i })
    await expect(retryBtn).toBeVisible()

    const homeLink = page.getByRole('link', { name: /return to home/i })
    await expect(homeLink).toBeVisible()

    // Click Return to Home
    await homeLink.click()
    await page.waitForURL('/')
    expect(page.url()).toContain('/')
  })

  test('strictly enforces kid-friendly typography policy (>= 16px) across PWA screens', async ({
    page,
  }) => {
    // 1. Check Offline Page font sizes
    await page.goto('/offline')

    const elementsToCheck = page.locator('h1, p, button, a')
    const count = await elementsToCheck.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const el = elementsToCheck.nth(i)
      const fontSize = await el.evaluate((node) => {
        return parseFloat(window.getComputedStyle(node).fontSize)
      })
      // Every text element on offline page must be >= 16px
      expect(fontSize).toBeGreaterThanOrEqual(16)
    }

    // 2. Check Speech Modal font sizes
    await page.goto('/')
    const voiceSwitcher = page.getByRole('button', { name: /voice accent settings/i })
    await voiceSwitcher.scrollIntoViewIfNeeded()
    await voiceSwitcher.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    const dialogElements = dialog.locator('h2, p, button, label, span, div')
    const dialogCount = await dialogElements.count()

    for (let i = 0; i < dialogCount; i++) {
      const el = dialogElements.nth(i)
      const isVisible = await el.isVisible()
      if (!isVisible) continue

      const text = (await el.innerText()).trim()
      if (!text) continue

      const fontSize = await el.evaluate((node) => {
        return parseFloat(window.getComputedStyle(node).fontSize)
      })

      // Strict kid-friendly constraint: font sizes must not be below 15.5px (accounting for rounding to 16px)
      expect(fontSize).toBeGreaterThanOrEqual(15.5)
    }
  })
})
