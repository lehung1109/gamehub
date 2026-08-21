// tests/app/admin/games/page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import GameConfigsPage, { generateMetadata } from '@/app/admin/games/[gameId]/page'

const { mockGetConfigsByGame, mockNotFound } = vi.hoisted(() => ({
  mockGetConfigsByGame: vi.fn(),
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

vi.mock('@/app/actions/configs', () => ({
  getConfigsByGame: (...args: unknown[]) => mockGetConfigsByGame(...args),
  deleteConfig: vi.fn(),
}))

describe('GameConfigsPage (/admin/games/[gameId])', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('triggers notFound when gameId is invalid', async () => {
    const params = Promise.resolve({ gameId: 'invalid-game' })
    await expect(GameConfigsPage({ params })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalled()
  })

  it('renders GameConfigsPage with game info and ConfigList', async () => {
    mockGetConfigsByGame.mockResolvedValue({
      data: [
        {
          id: 'cfg-1',
          user_id: 'user-1',
          game_id: 'flashcard',
          name: 'Flashcard 1A',
          settings: { topics: ['animals'] },
          share_slug: null,
          is_active: true,
          created_at: '2026-08-21T00:00:00Z',
          updated_at: '2026-08-21T00:00:00Z',
        },
      ],
    })

    const params = Promise.resolve({ gameId: 'flashcard' })
    const Component = await GameConfigsPage({ params })
    render(Component)

    expect(screen.getByRole('heading', { level: 1, name: 'Học từ vựng' })).toBeInTheDocument()
    expect(screen.getByText('Flashcard 1A')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tạo cấu hình mới/i })).toHaveAttribute(
      'href',
      '/admin/configs/new?gameId=flashcard'
    )
  })

  it('generates correct metadata', async () => {
    const params = Promise.resolve({ gameId: 'flashcard' })
    const metadata = await generateMetadata({ params })
    expect(metadata.title).toContain('Học từ vựng')
  })
})
