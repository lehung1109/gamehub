// tests/e2e/share-link.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Share Link Access Flow (User Story 4)', () => {
  test('public user opening invalid share slug sees friendly not-found page with home link', async ({
    page,
  }) => {
    await page.goto('/play/invalid-slug-999999')
    // Should render friendly UI without redirecting to login
    await expect(page).toHaveURL(/\/play\/invalid-slug-999999/)
    await expect(
      page.getByRole('heading', { name: /Không tìm thấy cấu hình game|Trang không tồn tại/i })
    ).toBeVisible()

    // Verify home button exists and links to homepage
    const homeLink = page.getByRole('link', { name: /Về trang chủ|Trang chủ/i })
    await expect(homeLink).toBeVisible()
    await homeLink.click()
    await expect(page).toHaveURL('/')
  })

  test('public student can access play slug route without authentication requirement', async ({
    page,
  }) => {
    // Should not redirect to /login
    await page.goto('/play/any-random-test-slug')
    expect(page.url()).not.toContain('/login')
  })

  test('zero auth tracking: student accessing play link does not receive auth tokens', async ({
    page,
    context,
  }) => {
    await page.goto('/play/test-non-auth-slug')
    const cookies = await context.cookies()
    const authCookies = cookies.filter((c) => c.name.includes('sb-') && c.name.includes('-auth-token'))
    expect(authCookies.length).toBe(0)
  })

  test('games support config query parameter without breaking default experience', async ({
    page,
  }) => {
    // Alphabet game with config param
    await page.goto('/games/alphabet?config=test-config-id')
    await expect(page.getByRole('heading', { level: 1, name: /Chữ cái & Phonics/i })).toBeVisible()

    // Listening game with config param
    await page.goto('/games/listening?config=test-config-id')
    await expect(page.getByRole('heading', { level: 1, name: /Nghe hiểu/i })).toBeVisible()

    // Numbers & Colors game with config param
    await page.goto('/games/numbers-colors?config=test-config-id')
    await expect(page.getByRole('heading', { level: 1, name: /Số & Màu sắc/i })).toBeVisible()

    // Sentences game with config param
    await page.goto('/games/sentences?config=test-config-id')
    await expect(page.getByRole('heading', { level: 1, name: /Luyện câu đơn giản/i })).toBeVisible()

    // Spelling game with config param
    await page.goto('/games/spelling?config=test-config-id')
    await expect(page.getByRole('heading', { level: 1, name: /Đánh vần & Ghép từ/i })).toBeVisible()

    // Flashcard game with config param
    await page.goto('/games/flashcard?config=test-config-id')
    await expect(page.getByRole('heading', { level: 1, name: /Học từ vựng qua Flashcard/i })).toBeVisible()
  })
})
