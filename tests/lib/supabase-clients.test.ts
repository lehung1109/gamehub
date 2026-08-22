// tests/lib/supabase-clients.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn((url: string, key: string) => ({
    url,
    key,
    type: 'browser',
  })),
  createServerClient: vi.fn((url: string, key: string, options: unknown) => ({
    url,
    key,
    options,
    type: 'server',
  })),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn((url: string, key: string, options: unknown) => ({
    url,
    key,
    options,
    type: 'admin',
  })),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([{ name: 'sb-token', value: 'xyz' }]),
    set: vi.fn(),
  }),
}))

describe('Supabase Client Factories', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  it('creates browser client with env vars', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const client = createClient()
    expect(client).toBeDefined()
    expect((client as unknown as { url: string; key: string }).url).toBe(
      'https://example.supabase.co'
    )
    expect((client as unknown as { url: string; key: string }).key).toBe(
      'test-anon-key'
    )
  })

  it('creates server client with async cookies and env vars', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const client = await createClient()
    expect(client).toBeDefined()
    expect((client as unknown as { url: string; key: string }).url).toBe(
      'https://example.supabase.co'
    )
    expect((client as unknown as { url: string; key: string }).key).toBe(
      'test-anon-key'
    )
  })

  it('creates admin client with SUPABASE_SERVICE_ROLE_KEY', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const client = createAdminClient()
    expect(client).toBeDefined()
    expect((client as unknown as { url: string; key: string }).key).toBe(
      'test-service-role-key'
    )
  })

  it('creates admin client fallback when service role key is missing', async () => {
    vi.unstubAllEnvs()
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const client = createAdminClient()
    expect(client).toBeDefined()
    expect((client as unknown as { url: string; key: string }).key).toBeTruthy()
  })
})
