// tests/components/admin/ConfigList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfigList } from '@/components/admin/ConfigList'
import type { Game } from '@/types'
import type { GameConfig } from '@/types/config'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

const mockDeleteConfig = vi.fn()
vi.mock('@/app/actions/configs', () => ({
  deleteConfig: (...args: unknown[]) => mockDeleteConfig(...args),
}))

const mockGame: Game = {
  id: 'flashcard',
  titleVi: 'Thẻ Từ Vựng',
  titleEn: 'Flashcards',
  slug: 'flashcards',
  route: '/games/flashcard',
  emoji: '🎴',
  description: 'Học từ vựng tiếng Anh qua hình ảnh sinh động và phát âm chuẩn.',
  priority: 1,
}

const mockConfigs: GameConfig[] = [
  {
    id: 'cfg-1',
    user_id: 'user-1',
    game_id: 'flashcard',
    name: 'Cấu hình Lớp 1A',
    settings: { topics: ['animals'], wordLimit: 5, autoSpeak: true },
    share_slug: null,
    is_active: true,
    created_at: '2026-08-21T00:00:00Z',
    updated_at: '2026-08-21T00:00:00Z',
  },
  {
    id: 'cfg-2',
    user_id: 'user-1',
    game_id: 'flashcard',
    name: 'Cấu hình Lớp 2B',
    settings: { topics: ['fruits'], wordLimit: 10, autoSpeak: false },
    share_slug: 'slug123',
    is_active: true,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z',
  },
]

describe('ConfigList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state when there are no configs', () => {
    render(<ConfigList game={mockGame} configs={[]} />)

    expect(screen.getByText(/chưa có cấu hình nào/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tạo cấu hình đầu tiên/i })).toHaveAttribute(
      'href',
      '/admin/configs/new?gameId=flashcard'
    )
  })

  it('renders list of config cards with name and edit link', () => {
    render(<ConfigList game={mockGame} configs={mockConfigs} />)

    expect(screen.getByText('Cấu hình Lớp 1A')).toBeInTheDocument()
    expect(screen.getByText('Cấu hình Lớp 2B')).toBeInTheDocument()

    const editLinks = screen.getAllByRole('link', { name: /chỉnh sửa/i })
    expect(editLinks).toHaveLength(2)
    expect(editLinks[0]).toHaveAttribute('href', '/admin/configs/cfg-1')
    expect(editLinks[1]).toHaveAttribute('href', '/admin/configs/cfg-2')
  })

  it('opens delete dialog when delete button is clicked', () => {
    render(<ConfigList game={mockGame} configs={mockConfigs} />)

    const deleteButtons = screen.getAllByRole('button', { name: /xóa/i })
    fireEvent.click(deleteButtons[0])

    expect(
      screen.getByRole('heading', { name: /xác nhận xóa cấu hình/i })
    ).toBeInTheDocument()
    expect(screen.getAllByText(/Cấu hình Lớp 1A/i).length).toBeGreaterThanOrEqual(2)
  })

  it('deletes config on confirmation and calls deleteConfig action', async () => {
    mockDeleteConfig.mockResolvedValue({ success: true })
    render(<ConfigList game={mockGame} configs={mockConfigs} />)

    const deleteButtons = screen.getAllByRole('button', { name: /xóa/i })
    fireEvent.click(deleteButtons[0])

    const confirmBtn = screen.getByRole('button', { name: /xác nhận xóa/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(mockDeleteConfig).toHaveBeenCalledWith('cfg-1')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('shows error banner when delete fails', async () => {
    mockDeleteConfig.mockResolvedValue({ error: 'Không thể xóa cấu hình này' })
    render(<ConfigList game={mockGame} configs={mockConfigs} />)

    const deleteButtons = screen.getAllByRole('button', { name: /xóa/i })
    fireEvent.click(deleteButtons[0])

    const confirmBtn = screen.getByRole('button', { name: /xác nhận xóa/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Không thể xóa cấu hình này')
    })
  })

  it('opens share dialog when share button is clicked', () => {
    render(<ConfigList game={mockGame} configs={mockConfigs} />)

    const shareButtons = screen.getAllByRole('button', { name: /chia sẻ/i })
    expect(shareButtons).toHaveLength(2)

    fireEvent.click(shareButtons[1]) // click on cfg-2 which has slug123
    expect(screen.getByRole('heading', { name: /chia sẻ cấu hình/i })).toBeInTheDocument()
  })
})

