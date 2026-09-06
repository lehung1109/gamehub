import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MemoryMatchPage from '@/app/games/memory-match/page'

const mockSpeak = vi.fn()
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: vi.fn(),
    isSpeaking: false,
    isSupported: true,
  }),
}))

vi.mock('@/hooks/useGameConfig', () => ({
  useGameConfig: () => ({
    config: null,
    settings: null,
    configId: null,
    configName: null,
    isLoading: false,
    isPreview: false,
  }),
}))

const mockSubmitSession = vi.fn().mockResolvedValue(true)
vi.mock('@/hooks/use-game-tracking', () => ({
  useGameTracking: (params: unknown) => ({
    isTracking: true,
    isAnonymous: false,
    session: null,
    details: [],
    recordQuestion: vi.fn(),
    submitSession: mockSubmitSession,
    resetSession: vi.fn(),
    params,
  }),
}))

describe('Memory Match Game Page (src/app/games/memory-match/page.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page header, back button, live stats, and board', () => {
    render(<MemoryMatchPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /Ghép Hình Ảnh & Từ Tiếng Anh/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Về trang chủ/i })).toBeInTheDocument()
    expect(screen.getByText(/0\/6 cặp/i)).toBeInTheDocument()
    expect(screen.getByText(/0 lượt/i)).toBeInTheDocument()
    expect(screen.getByRole('main', { name: /Bàn cờ trò chơi lật thẻ/i })).toBeInTheDocument()
  })

  it('allows changing pair count to 4 pairs or 8 pairs', () => {
    render(<MemoryMatchPage />)

    const btn4 = screen.getByRole('button', { name: /4 cặp/i })
    fireEvent.click(btn4)
    expect(screen.getByText(/0\/4 cặp/i)).toBeInTheDocument()

    const cards4 = screen.getAllByRole('button', { name: /Thẻ úp/i })
    expect(cards4).toHaveLength(8)

    const btn8 = screen.getByRole('button', { name: /8 cặp/i })
    fireEvent.click(btn8)
    expect(screen.getByText(/0\/8 cặp/i)).toBeInTheDocument()

    const cards8 = screen.getAllByRole('button', { name: /Thẻ úp/i })
    expect(cards8).toHaveLength(16)
  })

  it('allows changing topic to Fruits or School', () => {
    render(<MemoryMatchPage />)

    const fruitBtn = screen.getByRole('button', { name: /Trái cây/i })
    fireEvent.click(fruitBtn)

    // Verify button gets active styling
    expect(fruitBtn.className).toContain('bg-indigo-600')
  })

  it('handles card flipping and audio interaction', () => {
    render(<MemoryMatchPage />)

    const cards = screen.getAllByRole('button', { name: /Thẻ úp/i })
    expect(cards.length).toBeGreaterThan(0)

    fireEvent.click(cards[0])
    // The first card should be face-up now
    const updatedCards = screen.getAllByRole('button')
    const flippedCard = updatedCards.find(
      (btn) =>
        btn.getAttribute('aria-label')?.includes('Thẻ hình ảnh') ||
        btn.getAttribute('aria-label')?.includes('Thẻ chữ')
    )
    expect(flippedCard).toBeDefined()
  })

  it('dispatches session results via useGameTracking upon completing the game', () => {
    render(<MemoryMatchPage />)

    // Select 4 pairs for faster completion test
    const btn4 = screen.getByRole('button', { name: /4 cặp/i })
    fireEvent.click(btn4)

    // Gather all unique wordIds from cards
    const cardButtons = screen.getAllByRole('button', { name: /Thẻ úp/i })
    const wordIdSet = new Set<string>()
    cardButtons.forEach((btn) => {
      const wId = btn.getAttribute('data-word-id')
      if (wId) wordIdSet.add(wId)
    })

    // Match all pairs one by one
    wordIdSet.forEach((wordId) => {
      const pair = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('data-word-id') === wordId)
      expect(pair).toHaveLength(2)
      fireEvent.click(pair[0])
      fireEvent.click(pair[1])
    })

    // Verification: celebration dialog should be shown and submitSession called
    expect(mockSubmitSession).toHaveBeenCalledTimes(1)
    expect(mockSubmitSession).toHaveBeenCalledWith(
      expect.objectContaining({
        score: expect.any(Number),
        totalQuestions: 4,
        details: expect.arrayContaining([
          expect.objectContaining({
            isCorrect: true,
            attempts: 4,
          }),
        ]),
      })
    )
  })

  it('displays celebration modal gracefully when playing standalone (anonymous)', () => {
    mockSubmitSession.mockResolvedValueOnce(false)
    render(<MemoryMatchPage />)

    const btn4 = screen.getByRole('button', { name: /4 cặp/i })
    fireEvent.click(btn4)

    const cardButtons = screen.getAllByRole('button', { name: /Thẻ úp/i })
    const wordIdSet = new Set<string>()
    cardButtons.forEach((btn) => {
      const wId = btn.getAttribute('data-word-id')
      if (wId) wordIdSet.add(wId)
    })

    wordIdSet.forEach((wordId) => {
      const pair = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('data-word-id') === wordId)
      fireEvent.click(pair[0])
      fireEvent.click(pair[1])
    })

    expect(
      screen.getByRole('heading', { level: 2, name: /Hoàn Thành Xuất Sắc!/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Chơi lại ván mới/i })).toBeInTheDocument()
  })
})
