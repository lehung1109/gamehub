// tests/middleware.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetUser = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  it('redirects unauthenticated user from /admin/dashboard to /login with redirect param', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { middleware } = await import('@/middleware')

    const req = new NextRequest('http://localhost:3000/admin/dashboard')
    const res = await middleware(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/login?redirect=%2Fadmin%2Fdashboard'
    )
  })

  it('redirects unauthenticated user from /admin/games/flashcard to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { middleware } = await import('@/middleware')

    const req = new NextRequest('http://localhost:3000/admin/games/flashcard')
    const res = await middleware(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/login?redirect=%2Fadmin%2Fgames%2Fflashcard'
    )
  })

  it('allows authenticated user to access /admin/dashboard', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'teacher@school.edu' } },
    })
    const { middleware } = await import('@/middleware')

    const req = new NextRequest('http://localhost:3000/admin/dashboard')
    const res = await middleware(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('redirects authenticated user from /login to /admin/dashboard', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'teacher@school.edu' } },
    })
    const { middleware } = await import('@/middleware')

    const req = new NextRequest('http://localhost:3000/login')
    const res = await middleware(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/admin/dashboard')
  })

  it('redirects authenticated user from /login with redirect query param to the target admin path', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'teacher@school.edu' } },
    })
    const { middleware } = await import('@/middleware')

    const req = new NextRequest(
      'http://localhost:3000/login?redirect=%2Fadmin%2Fconfigs%2Fnew'
    )
    const res = await middleware(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/admin/configs/new'
    )
  })

  it('allows unauthenticated user to access /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { middleware } = await import('@/middleware')

    const req = new NextRequest('http://localhost:3000/login')
    const res = await middleware(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('allows public user to access game pages without redirect', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { middleware } = await import('@/middleware')

    const req = new NextRequest('http://localhost:3000/games/flashcard')
    const res = await middleware(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('allows public user to access /play/:slug without redirect', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { middleware } = await import('@/middleware')

    const req = new NextRequest('http://localhost:3000/play/abc123xyz')
    const res = await middleware(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })
})
