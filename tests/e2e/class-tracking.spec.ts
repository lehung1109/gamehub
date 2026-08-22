// tests/e2e/class-tracking.spec.ts
import { test, expect } from '@playwright/test'

// TODO: Build E2E auth fixture (seed test_admin user in local Supabase) before enabling
test.describe.skip('User Story 1: Teacher Class Management', () => {
  // Use a unique class name for each test run to avoid collisions
  const testClassName = `E2E Class ${Date.now()}`
  const newClassName = `${testClassName} - Edited`

  test('Teacher can create, rename, and deactivate a class', async ({ page }) => {
    // 1. Login
    await page.goto('/login')
    // We assume a valid test admin account exists. 
    // In actual E2E setup, you might seed this or use a known dev credential
    // For this boilerplate, assuming we can login with a dummy admin (which supabase local allows if seeded)
    // Here we'll use a known test account or mock if necessary.
    // Assuming 'admin@gamehub.local' / 'password123' works in the local dev environment.
    
    await page.fill('input[type="email"]', 'admin@gamehub.local')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*\/admin\/dashboard/)

    // 2. Navigate to Classes page
    await page.click('text=Quản lý Lớp học')
    await expect(page).toHaveURL(/.*\/admin\/dashboard\/classes/)

    // 3. Create a class
    await page.fill('input[id="className"]', testClassName)
    await page.click('button:has-text("Tạo lớp")')

    // Wait for success message
    await expect(page.locator('text=Tạo lớp thành công')).toBeVisible({ timeout: 10000 })
    
    // Check if the class code is displayed (6 chars uppercase)
    const codeElement = page.locator('.font-mono.tracking-widest')
    await expect(codeElement).toBeVisible()
    const classCode = await codeElement.textContent()
    expect(classCode?.trim().length).toBe(6)

    // Close success message to see the list again
    await page.click('button:has-text("Tạo thêm lớp khác")')

    // 4. Verify class is in the list
    const classCard = page.locator('.border-slate-200', { hasText: testClassName })
    await expect(classCard).toBeVisible()
    await expect(classCard.locator('text=Đang hoạt động')).toBeVisible()
    await expect(classCard.locator(`text=${classCode}`)).toBeVisible()

    // 5. Rename the class
    await classCard.locator('button:has-text("Đổi tên")').click()
    const renameDialog = page.locator('[role="dialog"]')
    await expect(renameDialog).toBeVisible()
    
    await page.fill('input[id="newName"]', newClassName)
    await renameDialog.locator('button:has-text("Lưu thay đổi")').click()

    // Verify rename
    await expect(page.locator('.border-slate-200', { hasText: newClassName })).toBeVisible()

    // 6. Deactivate the class
    const updatedClassCard = page.locator('.border-slate-200', { hasText: newClassName })
    await updatedClassCard.locator('button:has-text("Vô hiệu hóa")').click()
    
    const deactivateDialog = page.locator('[role="dialog"]')
    await expect(deactivateDialog).toBeVisible()
    await deactivateDialog.locator('button:has-text("Đồng ý vô hiệu hóa")').click()

    // Verify deactivation
    await expect(updatedClassCard.locator('text=Đã vô hiệu hóa')).toBeVisible()

    // 7. Re-activate the class
    await updatedClassCard.locator('button:has-text("Mở lại")').click()
    await expect(updatedClassCard.locator('text=Đang hoạt động')).toBeVisible()
  })
})
