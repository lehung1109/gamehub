// tests/e2e/web-push-notifications.spec.ts

import { test, expect } from '@playwright/test'
import { mockAnonymousStudent } from './helpers/auth-helper'

test.describe('Phase 12: Web Push Notifications & Learning Habit Engine E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page)
  })
  test('service worker sw.js serves valid push event and notificationclick handlers', async ({
    request,
  }) => {
    const res = await request.get('/sw.js')
    expect(res.status()).toBe(200)

    const content = await res.text()
    expect(content).toContain("self.addEventListener('push'")
    expect(content).toContain("self.addEventListener('notificationclick'")
    expect(content).toContain('showNotification')
    expect(content).toContain('clients.openWindow')
  })

  test('home page displays kid-friendly push notification prompt with >= 16px typography', async ({
    page,
  }) => {
    // Inject mock PushManager & Notification API into browser context
    await page.addInitScript(() => {
      Object.defineProperty(window, 'Notification', {
        writable: true,
        value: {
          permission: 'default',
          requestPermission: () => Promise.resolve('granted'),
        },
      })
    })

    await page.goto('/')

    // Locate push prompt banner
    const promptBanner = page.locator('aside[aria-label="Thông báo đẩy học tập"]')
    await expect(promptBanner).toBeVisible({ timeout: 10000 })

    // Check kid-friendly text content
    await expect(promptBanner).toContainText('Đừng để ngọn lửa học tập bị tắt!')
    await expect(promptBanner).toContainText('Bật thông báo ngay 🔔')
    await expect(promptBanner).toContainText('Để sau')

    // Verify kid-friendly typography rule: Strictly >= 16px font size across all text elements
    const fontSizes = await promptBanner.evaluate((el) => {
      const allElements = el.querySelectorAll('*')
      const sizes: { tag: string; text: string; fontSize: number; className: string }[] = []

      allElements.forEach((node) => {
        const text = node.textContent?.trim()
        if (text && node.children.length === 0) {
          const computed = window.getComputedStyle(node)
          const px = parseFloat(computed.fontSize)
          sizes.push({
            tag: node.tagName,
            text,
            fontSize: px,
            className: node.className,
          })
        }
      })
      return sizes
    })

    expect(fontSizes.length).toBeGreaterThan(0)
    for (const item of fontSizes) {
      expect(item.fontSize).toBeGreaterThanOrEqual(16)
      expect(item.className).not.toMatch(/text-xs/)
      expect(item.className).not.toMatch(/text-sm/)
      expect(item.className).not.toMatch(/text-\[10px\]/)
      expect(item.className).not.toMatch(/text-\[12px\]/)
      expect(item.className).not.toMatch(/text-\[14px\]/)
    }
  })

  test('clicking "Để sau" dismisses prompt and persists dismissal across reloads', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'Notification', {
        writable: true,
        value: {
          permission: 'default',
          requestPermission: () => Promise.resolve('default'),
        },
      })
    })

    await page.goto('/')

    const promptBanner = page.locator('aside[aria-label="Thông báo đẩy học tập"]')
    await expect(promptBanner).toBeVisible({ timeout: 10000 })

    const dismissBtn = promptBanner.getByRole('button', { name: /Để sau/i })
    await dismissBtn.click()

    await expect(promptBanner).not.toBeVisible()

    // Reload page
    await page.reload()

    // Should remain dismissed in current session
    await expect(promptBanner).not.toBeVisible()
  })

  test('parent portal displays accessible credentials form and information', async ({ page }) => {
    await page.goto('/parent')

    await expect(
      page.getByRole('heading', { name: /cổng thông tin phụ huynh/i })
    ).toBeVisible()

    // Tab buttons exist
    await expect(
      page.getByRole('button', { name: /mã pin phụ huynh/i })
    ).toBeVisible()
  })
})
