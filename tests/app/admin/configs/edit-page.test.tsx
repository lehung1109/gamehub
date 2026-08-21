// tests/app/admin/configs/edit-page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import EditConfigPage, { generateMetadata } from '@/app/admin/configs/[configId]/page'

const { mockGetUser, mockFrom, mockNotFound } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockNotFound: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound()
    throw new Error('NEXT_NOT_FOUND')
  },
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}))

describe('EditConfigPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('triggers notFound when config is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      }),
    })

    const params = Promise.resolve({ configId: 'non-existent' })
    await expect(EditConfigPage({ params })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalled()
  })

  it('renders ConfigEditForm when config is found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const configData = {
      id: 'cfg-100',
      user_id: 'user-1',
      game_id: 'flashcard',
      name: 'Flashcard Demo',
      settings: { topics: ['animals'], wordLimit: 5, autoSpeak: true },
      share_slug: null,
      is_active: true,
      created_at: '2026-08-21T00:00:00Z',
      updated_at: '2026-08-21T00:00:00Z',
    }

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: configData, error: null }),
          }),
        }),
      }),
    })

    const params = Promise.resolve({ configId: 'cfg-100' })
    const Component = await EditConfigPage({ params })
    render(Component)

    expect(screen.getByText(/chỉnh sửa cấu hình/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Flashcard Demo')).toBeInTheDocument()
  })

  it('generates correct metadata', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'cfg-100', name: 'Flashcard Tiếng Anh 1', game_id: 'flashcard' },
              error: null,
            }),
          }),
        }),
      }),
    })

    const params = Promise.resolve({ configId: 'cfg-100' })
    const metadata = await generateMetadata({ params })
    expect(metadata.title).toContain('Flashcard Tiếng Anh 1')
  })
})
