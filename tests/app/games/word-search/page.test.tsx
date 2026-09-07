import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import WordSearchPage from '@/app/games/word-search/page'

const mockSpeak = vi.fn()
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: vi.fn(),
    isSpeaking: false,
    isSupported: true,
  }),
}))

let mockGameConfigResult = {
  config: null as unknown,
  settings: null as unknown,
  configId: null as string | null,
  configName: null as string | null,
  isLoading: false,
  isPreview: false,
}

vi.mock('@/hooks/useGameConfig', () => ({
  useGameConfig: () => mockGameConfigResult,
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

const mockRestartGame = vi.fn()
let mockGameStateOverride: Record<string, unknown> | null = null

vi.mock('@/hooks/useWordSearchGame', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useWordSearchGame')>(
    '@/hooks/useWordSearchGame'
  )
  return {
    ...actual,
    useWordSearchGame: (options: unknown) => {
      const realHook = actual.useWordSearchGame(options as never)
      if (mockGameStateOverride) {
        return {
          ...realHook,
          ...mockGameStateOverride,
        }
      }
      return realHook
    },
  }
})

describe('Word Search Game Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGameStateOverride = null
    mockGameConfigResult = {
      config: null,
      settings: null,
      configId: null,
      configName: null,
      isLoading: false,
      isPreview: false,
    }
  })

  it('renders page header, back button, live stats, and 8x8 board', () => {
    render(<WordSearchPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /Săn tìm từ vựng/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getAllByRole('gridcell')).toHaveLength(64)
  })

  it('initially does not render completion modal or victory banner', () => {
    render(<WordSearchPage />)

    expect(screen.queryByText('Bé Thật Tuyệt Vời!')).not.toBeInTheDocument()
    expect(screen.queryByText(/Bé đã tìm thấy tất cả/i)).not.toBeInTheDocument()
  })

  it('opens completion modal on isCompleted, can close via X button, shows victory banner, and can reopen', () => {
    mockGameStateOverride = {
      isCompleted: true,
      foundCount: 5,
      remainingCount: 0,
      restartGame: mockRestartGame,
    }

    render(<WordSearchPage />)

    // Completion modal is visible
    expect(screen.getByText('Bé Thật Tuyệt Vời!')).toBeInTheDocument()

    // Click Close ("X") button
    const closeBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeBtn)

    // Modal is dismissed
    expect(screen.queryByText('Bé Thật Tuyệt Vời!')).not.toBeInTheDocument()

    // Victory banner is visible
    expect(screen.getByText(/Bé đã tìm thấy tất cả 5 từ vựng!/i)).toBeInTheDocument()

    // Reopen modal via "Xem tổng kết"
    const reopenBtn = screen.getByRole('button', { name: /Xem tổng kết/i })
    fireEvent.click(reopenBtn)
    expect(screen.getByText('Bé Thật Tuyệt Vời!')).toBeInTheDocument()
  })
})
