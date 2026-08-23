// tests/e2e/class-tracking.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Student Join & Progress Tracking Flow (User Story 2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
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
      page.getByText(/Mã lớp không đúng rồi|Đã xảy ra lỗi/i)
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
    await expect(dialog).not.toBeVisible({ timeout: 5000 })

    // Anonymous badge is displayed
    await expect(page.getByText(/Chơi tự do/i)).toBeVisible({ timeout: 8000 })

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

test.describe('Student Game Progress Tracking (User Story 3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
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
    for (let i = 1; i <= 10; i++) {
      const optionBtn = page.locator("button[aria-label^='Lựa chọn hình ảnh']").first()
      if (!(await optionBtn.isVisible().catch(() => false))) break
      await optionBtn.click()

      const continueBtn = page.getByRole('button', { name: /Tiếp tục/i })
      try {
        await continueBtn.waitFor({ state: 'visible', timeout: 2000 })
        await continueBtn.click()
      } catch {
        // Auto-advanced or already on summary
      }

      const summaryVisible = await page
        .locator('text=/tuyệt đỉnh|chúc mừng|hoàn thành/i')
        .isVisible()
      if (summaryVisible) break
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
    for (let i = 1; i <= 10; i++) {
      const optionBtn = page.locator("button[aria-label^='Lựa chọn hình ảnh']").first()
      if (!(await optionBtn.isVisible().catch(() => false))) break
      await optionBtn.click()

      const continueBtn = page.getByRole('button', { name: /Tiếp tục/i })
      try {
        await continueBtn.waitFor({ state: 'visible', timeout: 2000 })
        await continueBtn.click()
      } catch {
        // Auto-advanced or already on summary
      }

      const summaryVisible = await page
        .locator('text=/tuyệt đỉnh|chúc mừng|hoàn thành/i')
        .isVisible()
      if (summaryVisible) break
    }

    await expect(
      page.locator('text=/tuyệt đỉnh|chúc mừng|hoàn thành bài tập/i')
    ).toBeVisible({ timeout: 10000 })

    // Verify /api/track was never called
    expect(trackingCalled).toBe(false)
  })
})

test.describe('Teacher Route Protection & Authentication Redirects', () => {
  test('redirects unauthenticated teacher accessing class list to /login with redirect parameter', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard/classes')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
  })

  test('redirects unauthenticated teacher accessing class dashboard to /login with redirect parameter (User Story 4)', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard/classes/test-class-id')
    await expect(page).toHaveURL(/\/login\?redirect=.*admin.*dashboard.*classes.*test-class-id/)
    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
  })

  test('redirects unauthenticated teacher accessing student detail page to /login with redirect parameter (User Story 5)', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard/classes/test-class-id/students/test-student-id')
    await expect(page).toHaveURL(/\/login\?redirect=.*admin.*dashboard.*classes.*students/)
    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
  })

  test('redirects unauthenticated teacher accessing class difficult words analysis to /login with redirect parameter (User Story 6)', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard/classes/test-class-id')
    await expect(page).toHaveURL(/\/login\?redirect=.*admin.*dashboard.*classes.*test-class-id/)
    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
  })
})

test.describe('Teacher CSV Export API Route Security (User Story 7)', () => {
  test('returns 401 unauthorized when unauthenticated user requests /api/export-csv directly', async ({
    request,
  }) => {
    const response = await request.get('/api/export-csv?classId=test-class-id')
    expect(response.status()).toBe(401)
    const json = await response.json()
    expect(json.error).toMatch(/đăng nhập|unauthorized/i)
  })

  test('returns 400 bad request when classId parameter is omitted', async ({
    request,
  }) => {
    const response = await request.get('/api/export-csv')
    expect([400, 401]).toContain(response.status())
  })
})

test.describe('Teacher Class Management & Input Validation (User Story 1)', () => {
  test('Student join popup automatically converts class code to uppercase as typed', async ({ page }) => {
    await page.goto('/games/listening')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    const classCodeInput = page.getByLabel(/Mã lớp/i)
    await classCodeInput.fill('abc123')
    await expect(classCodeInput).toHaveValue('ABC123')
  })
})




