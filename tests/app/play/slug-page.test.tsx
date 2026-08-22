import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlaySlugPage from '@/app/play/[slug]/page'
import * as navigation from 'next/navigation'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// Mock Supabase server client
const mockSelect = vi.fn()
const mockEqSlug = vi.fn()
const mockEqActive = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: vi.fn().mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEqSlug.mockReturnValue({
          eq: mockEqActive.mockReturnValue({
            single: mockSingle,
          }),
        }),
      }),
    }),
  })),
}))

describe('/play/[slug] resolver page (T038 / US4)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to the appropriate game page with ?config=id when valid config found', async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'cfg-101',
        game_id: 'listening',
        name: 'Lớp 2A - Luyện nghe',
        settings: { questionCount: 5 },
      },
      error: null,
    })

    await PlaySlugPage({
      params: Promise.resolve({ slug: 'valid-slug-123' }),
    })

    expect(navigation.redirect).toHaveBeenCalledWith('/games/listening?config=cfg-101')
  })

  it('renders a friendly not-found error message when slug does not exist', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Row not found' },
    })

    const PageComponent = await PlaySlugPage({
      params: Promise.resolve({ slug: 'non-existent-slug' }),
    })

    render(PageComponent)

    expect(screen.getByRole('heading', { name: /Không tìm thấy cấu hình game/i })).toBeInTheDocument()
    expect(screen.getByText(/Liên kết chia sẻ này không tồn tại hoặc đã bị xóa/i)).toBeInTheDocument()
    const homeLink = screen.getByRole('link', { name: /Về trang chủ/i })
    expect(homeLink).toHaveAttribute('href', '/')
  })
})
