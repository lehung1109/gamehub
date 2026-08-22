// tests/components/config/ConfigEditForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfigEditForm } from '@/components/config/ConfigEditForm'
import type { Game } from '@/types'
import type { GameConfig, FlashcardSettings, GameId } from '@/types/config'
import { decodePreviewSettings } from '@/lib/preview'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

const mockUpdateConfig = vi.fn()
vi.mock('@/app/actions/configs', () => ({
  updateConfig: (...args: unknown[]) => mockUpdateConfig(...args),
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

const mockConfig: GameConfig = {
  id: 'cfg-100',
  user_id: 'user-1',
  game_id: 'flashcard',
  name: 'Flashcard Tuần 1',
  settings: { topics: ['animals'], wordLimit: 5, autoSpeak: true },
  share_slug: null,
  is_active: true,
  created_at: '2026-08-21T00:00:00Z',
  updated_at: '2026-08-21T00:00:00Z',
}

describe('ConfigEditForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders pre-filled data correctly', () => {
    render(<ConfigEditForm game={mockGame} config={mockConfig} />)

    expect(screen.getByText(/chỉnh sửa cấu hình/i)).toBeInTheDocument()
    const nameInput = screen.getByLabelText(/tên cấu hình bài học/i) as HTMLInputElement
    expect(nameInput.value).toBe('Flashcard Tuần 1')
    expect(screen.getByRole('button', { name: /lưu thay đổi/i })).toBeInTheDocument()
  })

  it('submits updated name and settings to updateConfig', async () => {
    mockUpdateConfig.mockResolvedValue({ data: { ...mockConfig, name: 'Flashcard Tuần 2' } })
    render(<ConfigEditForm game={mockGame} config={mockConfig} />)

    const nameInput = screen.getByLabelText(/tên cấu hình bài học/i)
    fireEvent.change(nameInput, { target: { value: 'Flashcard Tuần 2' } })

    const submitBtn = screen.getByRole('button', { name: /lưu thay đổi/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockUpdateConfig).toHaveBeenCalledWith(
        'cfg-100',
        expect.objectContaining({
          name: 'Flashcard Tuần 2',
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/admin/games/flashcard')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('displays error message if updateConfig fails', async () => {
    mockUpdateConfig.mockResolvedValue({ error: 'Tên cấu hình đã tồn tại' })
    render(<ConfigEditForm game={mockGame} config={mockConfig} />)

    const submitBtn = screen.getByRole('button', { name: /lưu thay đổi/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Tên cấu hình đã tồn tại')
    })
  })

  it('renders PreviewButton and previews modified settings before saving', () => {
    const mockWindowOpen = vi.fn()
    vi.stubGlobal('open', mockWindowOpen)

    render(<ConfigEditForm game={mockGame} config={mockConfig} />)

    const previewBtn = screen.getByRole('button', { name: /chơi thử/i })
    expect(previewBtn).toBeInTheDocument()

    // Modify a setting in the form: change wordLimit from 5 to 15
    const wordLimitInput = screen.getByLabelText(/số lượng từ tối đa/i)
    fireEvent.change(wordLimitInput, { target: { value: '15' } })

    // Click "Chơi thử"
    fireEvent.click(previewBtn)

    expect(mockWindowOpen).toHaveBeenCalledTimes(1)
    const [previewUrl, target] = mockWindowOpen.mock.calls[0]
    expect(previewUrl).toMatch(/^\/games\/flashcard\?preview=/)
    expect(target).toBe('_blank')

    // Explicitly verify the payload contains the modified wordLimit (15), not the original (5)
    const encoded = previewUrl.split('preview=')[1]
    const decoded = decodePreviewSettings(encoded)
    expect(decoded).not.toBeNull()
    expect(decoded?.gameId).toBe('flashcard')
    expect((decoded?.settings as FlashcardSettings).wordLimit).toBe(15)

    // Ensure form was not submitted
    expect(mockUpdateConfig).not.toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('displays error in alert banner when preview validation fails', () => {
    const mockWindowOpen = vi.fn()
    vi.stubGlobal('open', mockWindowOpen)

    const invalidGame = { ...mockGame, id: 'invalid-game' as GameId }
    render(<ConfigEditForm game={invalidGame} config={mockConfig} />)

    const previewBtn = screen.getByRole('button', { name: /chơi thử/i })
    fireEvent.click(previewBtn)

    expect(mockWindowOpen).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/invalid game id/i)

    vi.unstubAllGlobals()
  })
})

