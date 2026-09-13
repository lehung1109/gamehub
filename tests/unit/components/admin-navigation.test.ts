import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('Admin Navigation & Community Entry Points', () => {
  it('verifies admin layout contains Community nav link', () => {
    const layoutPath = path.resolve(process.cwd(), 'src/app/admin/layout.tsx')
    expect(fs.existsSync(layoutPath)).toBe(true)
    const content = fs.readFileSync(layoutPath, 'utf-8')

    expect(content).toContain('href="/admin/community"')
    expect(content).toContain('Cộng đồng')
  })

  it('verifies admin dashboard page contains Community Marketplace quick access card', () => {
    const dashboardPath = path.resolve(process.cwd(), 'src/app/admin/dashboard/page.tsx')
    expect(fs.existsSync(dashboardPath)).toBe(true)
    const content = fs.readFileSync(dashboardPath, 'utf-8')

    expect(content).toContain('href="/admin/community"')
    expect(content).toContain('Thư viện Cộng đồng')
  })
})
