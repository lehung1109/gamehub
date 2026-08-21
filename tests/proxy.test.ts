// tests/proxy.test.ts
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

describe('Auth Proxy (Next.js 16)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  it('redirects unauthenticated user from /admin/dashboard to /login with redirect param', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { proxy } = await import('@/proxy')

    const req = new NextRequest('http://localhost:3000/admin/dashboard')
    const res = await proxy(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/login?redirect=%2Fadmin%2Fdashboard'
    )
  })

  it('preserves query parameters in redirect when redirecting unauthenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { proxy } = await import('@/proxy')

    const req = new NextRequest('http://localhost:3000/admin/configs/new?gameId=flashcard')
    const res = await proxy(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/login?redirect=%2Fadmin%2Fconfigs%2Fnew%3FgameId%3Dflashcard'
    )
  })

  it('redirects unauthenticated user from /admin/games/flashcard to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { proxy } = await import('@/proxy')

    const req = new NextRequest('http://localhost:3000/admin/games/flashcard')
    const res = await proxy(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/login?redirect=%2Fadmin%2Fgames%2Fflashcard'
    )
  })

  it('allows authenticated user to access /admin/dashboard', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'teacher@school.edu' } },
    })
    const { proxy } = await import('@/proxy')

    const req = new NextRequest('http://localhost:3000/admin/dashboard')
    const res = await proxy(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('redirects authenticated user from /login to /admin/dashboard', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'teacher@school.edu' } },
    })
    const { proxy } = await import('@/proxy')

    const req = new NextRequest('http://localhost:3000/login')
    const res = await proxy(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/admin/dashboard')
  })

  it('redirects authenticated user from /login with redirect query param to the target admin path', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'teacher@school.edu' } },
    })
    const { proxy } = await import('@/proxy')

    const req = new NextRequest(
      'http://localhost:3000/login?redirect=%2Fadmin%2Fconfigs%2Fnew'
    )
    const res = await proxy(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/admin/configs/new'
    )
  })

  it('blocks open redirect attempts from invalid redirect params', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'teacher@school.edu' } },
    })
    const { proxy } = await import('@/proxy')

    const req = new NextRequest(
      'http://localhost:3000/login?redirect=https%3A%2F%2Fattacker.com'
    )
    const res = await proxy(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/admin/dashboard'
    )
  })

  it('allows unauthenticated user to access /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { proxy } = await import('@/proxy')

    const req = new NextRequest('http://localhost:3000/login')
    const res = await proxy(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('allows public user to access game pages without redirect', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { proxy } = await import('@/proxy')

    const req = new NextRequest('http://localhost:3000/games/flashcard')
    const res = await proxy(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('allows public user to access /play/:slug without redirect', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { proxy } = await import('@/proxy')

    const req = new NextRequest('http://localhost:3000/play/abc123xyz')
    const res = await proxy(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })
})
