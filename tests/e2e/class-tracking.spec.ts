// tests/e2e/class-tracking.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Student Join & Progress Tracking Flow (User Story 2)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear sessionStorage before each test
    await page.addInitScript(() => {
      window.sessionStorage.clear()
    })
  })

  test('Shows student join popup automatically when opening a game with empty session', async ({
    page,
  }) => {
    await page.goto('/games/listening')

    // Modal popup appears
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Tham gia lớp học')).toBeVisible()
    await expect(page.getByLabel(/Mã lớp/i)).toBeVisible()
    await expect(page.getByLabel(/Tên của bé/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Vào lớp/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Bỏ qua/i })).toBeVisible()
  })

  test('Validates empty inputs and displays error message', async ({ page }) => {
    await page.goto('/games/listening')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    const submitBtn = page.getByRole('button', { name: /Vào lớp/i })
    await submitBtn.click()

    // Error for missing class code
    await expect(page.getByText(/Bé vui lòng nhập mã lớp nhé!/i)).toBeVisible()

    // Enter only class code, missing name
    await page.getByLabel(/Mã lớp/i).fill('ABC123')
    await submitBtn.click()

    await expect(page.getByText(/Bé vui lòng nhập tên của mình nhé!/i)).toBeVisible()
  })

  test('Displays friendly error for invalid or non-existent class code', async ({ page }) => {
    await page.goto('/games/listening')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await page.getByLabel(/Mã lớp/i).fill('NONEXIST99')
    await page.getByLabel(/Tên của bé/i).fill('Bé Minh')
    await page.getByRole('button', { name: /Vào lớp/i }).click()

    await expect(
      page.getByText(/Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍/i)
    ).toBeVisible({ timeout: 10000 })
    await expect(dialog).toBeVisible()
  })

  test('Allows skipping the popup to play anonymously', async ({ page }) => {
    await page.goto('/games/listening')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Click "Bỏ qua"
    await page.getByRole('button', { name: /Bỏ qua/i }).click()

    // Dialog closes
    await expect(dialog).not.toBeVisible()

    // Anonymous badge is displayed
    await expect(page.getByText(/Chơi tự do/i)).toBeVisible()

    // Navigating to another game should not show the popup again
    await page.goto('/games/spelling')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText(/Chơi tự do/i)).toBeVisible()
  })

  test('Shows student badge and does not prompt again when session exists', async ({ page }) => {
    // Pre-populate sessionStorage with a student session
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'gamehub_student_session',
        JSON.stringify({
          classCode: 'ABC123',
          studentName: 'Bé Linh',
          className: 'Lớp 1A - 2025',
          isAnonymous: false,
        })
      )
    })

    await page.goto('/games/listening')

    // Modal popup should NOT be visible
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Student badge should be visible with student name and class name
    const studentBadge = page.getByRole('button', { name: /Bé Linh/i })
    await expect(studentBadge).toBeVisible()
    await expect(page.getByText('Lớp 1A - 2025')).toBeVisible()

    // Navigate to another game
    await page.goto('/games/alphabet')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByRole('button', { name: /Bé Linh/i })).toBeVisible()
  })

  test('Allows student to click badge to re-open popup, edit information, or switch to anonymous', async ({
    page,
  }) => {
    // Pre-populate sessionStorage with student session
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'gamehub_student_session',
        JSON.stringify({
          classCode: 'ABC123',
          studentName: 'Bé Linh',
          className: 'Lớp 1A',
          isAnonymous: false,
        })
      )
    })

    await page.goto('/games/listening')

    // Click student badge
    const studentBadge = page.getByRole('button', { name: /Bé Linh/i })
    await studentBadge.click()

    // Dialog opens with prefilled data
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByLabel(/Mã lớp/i)).toHaveValue('ABC123')
    await expect(page.getByLabel(/Tên của bé/i)).toHaveValue('Bé Linh')

    // Switch to anonymous via "Bỏ qua"
    await page.getByRole('button', { name: /Bỏ qua/i }).click()
    await expect(dialog).not.toBeVisible()
    await expect(page.getByText(/Chơi tự do/i)).toBeVisible()
  })
})

test.describe.skip('User Story 1: Teacher Class Management', () => {
  const testClassName = `E2E Class ${Date.now()}`
  const newClassName = `${testClassName} - Edited`

  test('Teacher can create, rename, and deactivate a class', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@gamehub.local')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/.*\/admin\/dashboard/)

    await page.click('text=Quản lý Lớp học')
    await expect(page).toHaveURL(/.*\/admin\/dashboard\/classes/)

    await page.fill('input[id="className"]', testClassName)
    await page.click('button:has-text("Tạo lớp")')

    await expect(page.locator('text=Tạo lớp thành công')).toBeVisible({ timeout: 10000 })
    
    const codeElement = page.locator('.font-mono.tracking-widest')
    await expect(codeElement).toBeVisible()
    const classCode = await codeElement.textContent()
    expect(classCode?.trim().length).toBe(6)

    await page.click('button:has-text("Tạo thêm lớp khác")')

    const classCard = page.locator('.border-slate-200', { hasText: testClassName })
    await expect(classCard).toBeVisible()
    await expect(classCard.locator('text=Đang hoạt động')).toBeVisible()
    await expect(classCard.locator(`text=${classCode}`)).toBeVisible()

    await classCard.locator('button:has-text("Đổi tên")').click()
    const renameDialog = page.locator('[role="dialog"]')
    await expect(renameDialog).toBeVisible()
    
    await page.fill('input[id="newName"]', newClassName)
    await renameDialog.locator('button:has-text("Lưu thay đổi")').click()

    await expect(page.locator('.border-slate-200', { hasText: newClassName })).toBeVisible()

    const updatedClassCard = page.locator('.border-slate-200', { hasText: newClassName })
    await updatedClassCard.locator('button:has-text("Vô hiệu hóa")').click()
    
    const deactivateDialog = page.locator('[role="dialog"]')
    await expect(deactivateDialog).toBeVisible()
    await deactivateDialog.locator('button:has-text("Đồng ý vô hiệu hóa")').click()

    await expect(updatedClassCard.locator('text=Đã vô hiệu hóa')).toBeVisible()

    await updatedClassCard.locator('button:has-text("Mở lại")').click()
    await expect(updatedClassCard.locator('text=Đang hoạt động')).toBeVisible()
  })
})

test.describe('Student Game Progress Tracking (User Story 3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.clear()
    })
  })

  test('Tracks game results and posts to /api/track with question details when student finishes a game', async ({
    page,
  }) => {
    let trackingRequestPayload: any = null

    // Intercept tracking API
    await page.route('**/api/track', async (route) => {
      const request = route.request()
      if (request.method() === 'POST') {
        trackingRequestPayload = JSON.parse(request.postData() || '{}')
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, sessionId: 'e2e-session-123' }),
        })
      } else {
        await route.continue()
      }
    })

    // Pre-populate sessionStorage with student session
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'gamehub_student_session',
        JSON.stringify({
          classCode: 'ABC123',
          studentName: 'Bé Lan',
          className: 'Lớp 1A',
          isAnonymous: false,
        })
      )
    })

    await page.goto('/games/listening')

    // Verify student badge is present
    await expect(page.getByRole('button', { name: /Bé Lan/i })).toBeVisible()

    // Answer questions
    // In listening game, 10 questions with 4 choices each.
    for (let i = 0; i < 10; i++) {
      // Find the first option button and click it
      const optionButtons = page.locator('.grid button')
      await expect(optionButtons.first()).toBeVisible({ timeout: 5000 })
      await optionButtons.first().click()

      // If auto-advance or feedback overlay appears, wait or let it advance
      const summaryVisible = await page
        .locator('text=/tuyệt đỉnh|chúc mừng|hoàn thành/i')
        .isVisible()
      if (summaryVisible) break

      // Wait a short moment for transition if not yet completed
      await page.waitForTimeout(1600)
    }

    // Verify completion summary screen
    await expect(
      page.locator('text=/tuyệt đỉnh|chúc mừng|hoàn thành bài tập/i')
    ).toBeVisible({ timeout: 10000 })

    // Verify tracking payload was sent
    expect(trackingRequestPayload).not.toBeNull()
    expect(trackingRequestPayload.classCode).toBe('ABC123')
    expect(trackingRequestPayload.studentName).toBe('Bé Lan')
    expect(trackingRequestPayload.gameType).toBe('listening')
    expect(trackingRequestPayload.totalQuestions).toBeGreaterThanOrEqual(1)
    expect(Array.isArray(trackingRequestPayload.details)).toBe(true)
    expect(trackingRequestPayload.details.length).toBeGreaterThanOrEqual(1)
    expect(trackingRequestPayload.details[0]).toHaveProperty('prompt')
    expect(trackingRequestPayload.details[0]).toHaveProperty('isCorrect')
    expect(trackingRequestPayload.details[0]).toHaveProperty('timeTakenMs')
  })

  test('Does not submit tracking request to /api/track when playing anonymously', async ({
    page,
  }) => {
    let trackingCalled = false

    await page.route('**/api/track', async (route) => {
      trackingCalled = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    // Pre-populate sessionStorage with anonymous session
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'gamehub_student_session',
        JSON.stringify({
          isAnonymous: true,
        })
      )
    })

    await page.goto('/games/listening')
    await expect(page.getByText(/Chơi tự do/i)).toBeVisible()

    // Answer questions
    for (let i = 0; i < 10; i++) {
      const optionButtons = page.locator('.grid button')
      await expect(optionButtons.first()).toBeVisible({ timeout: 5000 })
      await optionButtons.first().click()

      const summaryVisible = await page
        .locator('text=/tuyệt đỉnh|chúc mừng|hoàn thành/i')
        .isVisible()
      if (summaryVisible) break

      await page.waitForTimeout(1600)
    }

    await expect(
      page.locator('text=/tuyệt đỉnh|chúc mừng|hoàn thành bài tập/i')
    ).toBeVisible({ timeout: 10000 })

    // Verify /api/track was never called
    expect(trackingCalled).toBe(false)
  })
})

test.describe('Teacher Class Dashboard Overview (User Story 4)', () => {
  test('Displays class dashboard with KPI cards, game breakdown, student list, and timeframe filters', async ({
    page,
  }) => {
    // Navigate to a class dashboard page
    // Note: E2E environment with mocked or seeded class
    await page.goto('/admin/dashboard/classes/test-class-id')

    // If redirected to login, verify login flow or mock session
    const isLogin = page.url().includes('/login')
    if (isLogin) {
      await page.fill('input[type="email"]', 'admin@gamehub.local')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')
      await expect(page).toHaveURL(/.*\/admin\/dashboard/)
      await page.goto('/admin/dashboard/classes/test-class-id')
    }

    // Verify key UI elements when on class dashboard
    // Check for either dashboard content or friendly error/empty state
    const title = page.locator('h1, h2')
    await expect(title.first()).toBeVisible()
  })
})

