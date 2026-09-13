import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { DuelScoreBar } from '@/components/duel/DuelScoreBar'
import { DuelQuestionCard } from '@/components/duel/DuelQuestionCard'
import { DuelPodiumModal } from '@/components/duel/DuelPodiumModal'
import DuelArenaPage from '@/app/duel/[code]/page'
import {
  getDuelStateAction,
  submitDuelAnswerAction,
  createRematchAction,
} from '@/app/actions/duels'
import type { DuelQuestion, DuelState } from '@/types/duels'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}))

vi.mock('@/app/actions/duels', () => ({
  getDuelStateAction: vi.fn(),
  submitDuelAnswerAction: vi.fn(),
  createRematchAction: vi.fn(),
}))

let mockSession: { studentName: string } | null = null
vi.mock('@/contexts/StudentSessionContext', () => ({
  useStudentSession: () => ({
    session: mockSession,
  }),
}))

const sampleQuestion: DuelQuestion = {
  id: 'q1',
  prompt: 'Từ "Apple" có nghĩa là gì?',
  options: ['Quả táo', 'Quả chuối', 'Quả cam', 'Quả lê'],
  correctAnswer: 'Quả táo',
  explanationVi: '"Apple" nghĩa là quả táo',
}

describe('DuelScoreBar Component', () => {
  it('renders player 1 and player 2 with scores and streak flames if streak > 1', () => {
    render(
      <DuelScoreBar
        player1={{ name: 'Minh', avatar: '🦊', score: 350, streak: 3 }}
        player2={{ name: 'Linh', avatar: '🐼', score: 200, streak: 2 }}
        currentRound={2}
        totalRounds={5}
      />
    )

    expect(screen.getByTestId('duel-score-bar')).toBeDefined()
    expect(screen.getByText('Minh')).toBeDefined()
    expect(screen.getByText('Linh')).toBeDefined()
    expect(screen.getByText('🦊')).toBeDefined()
    expect(screen.getByText('🐼')).toBeDefined()

    const p1Score = screen.getByTestId('player1-score')
    expect(p1Score.textContent).toContain('350')

    const p2Score = screen.getByTestId('player2-score')
    expect(p2Score.textContent).toContain('200')

    const p1Streak = screen.getByTestId('player1-streak')
    expect(p1Streak.textContent).toContain('3')

    const p2Streak = screen.getByTestId('player2-streak')
    expect(p2Streak.textContent).toContain('2')

    // Round indicator
    expect(screen.getByText(/2\s*\/\s*5/)).toBeDefined()
  })

  it('hides or omits flame badge if streak is 1 or less', () => {
    render(
      <DuelScoreBar
        player1={{ name: 'Minh', avatar: '🦊', score: 100, streak: 1 }}
        player2={{ name: 'Linh', avatar: '🐼', score: 50, streak: 0 }}
        currentRound={1}
        totalRounds={5}
      />
    )

    const p1Streak = screen.getByTestId('player1-streak')
    const p2Streak = screen.getByTestId('player2-streak')

    expect(p1Streak.textContent).not.toContain('🔥')
    expect(p2Streak.textContent).not.toContain('🔥')
  })

  it('renders gracefully when player2 is null or undefined', () => {
    render(
      <DuelScoreBar
        player1={{ name: 'Minh', avatar: '🦊', score: 0, streak: 0 }}
        player2={null}
        currentRound={1}
        totalRounds={5}
      />
    )

    expect(screen.getByTestId('duel-score-bar')).toBeDefined()
    expect(screen.getByTestId('player2-score')).toBeDefined()
    expect(screen.getByText(/đang chờ/i)).toBeDefined()
  })
})

describe('DuelQuestionCard Component', () => {
  it('renders question prompt, options and countdown timer', () => {
    const handleSelect = vi.fn()
    render(
      <DuelQuestionCard
        question={sampleQuestion}
        questionIndex={0}
        totalQuestions={5}
        timeRemainingSeconds={8}
        selectedOptionIndex={null}
        onSelectOption={handleSelect}
      />
    )

    expect(screen.getByTestId('duel-question-card')).toBeDefined()
    expect(screen.getByText('Từ "Apple" có nghĩa là gì?')).toBeDefined()

    const timer = screen.getByTestId('duel-timer')
    expect(timer.textContent).toContain('8')

    sampleQuestion.options.forEach((opt, idx) => {
      const btn = screen.getByTestId(`duel-option-${idx}`)
      expect(btn.textContent).toContain(opt)
      expect(btn.hasAttribute('disabled')).toBe(false)
    })
  })

  it('handles option click and fires onSelectOption callback', () => {
    const handleSelect = vi.fn()
    render(
      <DuelQuestionCard
        question={sampleQuestion}
        questionIndex={0}
        totalQuestions={5}
        timeRemainingSeconds={7}
        selectedOptionIndex={null}
        onSelectOption={handleSelect}
      />
    )

    const opt0 = screen.getByTestId('duel-option-0')
    fireEvent.click(opt0)
    expect(handleSelect).toHaveBeenCalledWith(0)
  })

  it('disables options when disabled is true or option is already selected', () => {
    const handleSelect = vi.fn()
    const { rerender } = render(
      <DuelQuestionCard
        question={sampleQuestion}
        questionIndex={0}
        totalQuestions={5}
        timeRemainingSeconds={5}
        selectedOptionIndex={0}
        onSelectOption={handleSelect}
      />
    )

    const opt1 = screen.getByTestId('duel-option-1')
    expect(opt1.hasAttribute('disabled')).toBe(true)

    rerender(
      <DuelQuestionCard
        question={sampleQuestion}
        questionIndex={0}
        totalQuestions={5}
        timeRemainingSeconds={5}
        selectedOptionIndex={null}
        onSelectOption={handleSelect}
        disabled={true}
      />
    )

    const opt0 = screen.getByTestId('duel-option-0')
    expect(opt0.hasAttribute('disabled')).toBe(true)
  })

  it('highlights correct and wrong answers when showResult is true', () => {
    render(
      <DuelQuestionCard
        question={sampleQuestion}
        questionIndex={0}
        totalQuestions={5}
        timeRemainingSeconds={3}
        selectedOptionIndex={1} // selected "Quả chuối" (wrong), correct is "Quả táo" (index 0)
        onSelectOption={vi.fn()}
        showResult={true}
      />
    )

    // Option 0 (correct) should have green styling
    const opt0 = screen.getByTestId('duel-option-0')
    expect(opt0.className).toMatch(/emerald|green/)

    // Option 1 (selected wrong) should have red/rose styling
    const opt1 = screen.getByTestId('duel-option-1')
    expect(opt1.className).toMatch(/rose|red/)

    // Shows explanation
    expect(screen.getByText('"Apple" nghĩa là quả táo')).toBeDefined()
  })
})

describe('DuelPodiumModal Component', () => {
  const defaultProps = {
    isOpen: true,
    winnerName: 'Minh',
    isTie: false,
    isWinner: true,
    player1: { name: 'Minh', avatar: '🦊', score: 500 },
    player2: { name: 'Linh', avatar: '🐼', score: 320 },
    onRematch: vi.fn(),
    onBackToHub: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    render(<DuelPodiumModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('duel-podium-modal')).toBeNull()
  })

  it('renders winner announcement and scores when open', () => {
    render(<DuelPodiumModal {...defaultProps} />)
    expect(screen.getByTestId('duel-podium-modal')).toBeDefined()
    expect(screen.getByRole('dialog')).toBeDefined()

    const winnerAnnouncement = screen.getByTestId('winner-announcement')
    expect(winnerAnnouncement.textContent).toContain('Minh')

    expect(screen.getByText('500')).toBeDefined()
    expect(screen.getByText('320')).toBeDefined()
    expect(screen.getByTestId('rematch-button')).toBeDefined()
    expect(screen.getByTestId('back-to-hub-button')).toBeDefined()
  })

  it('renders tie announcement when isTie is true', () => {
    render(<DuelPodiumModal {...defaultProps} winnerName={null} isTie={true} isWinner={false} />)
    const winnerAnnouncement = screen.getByTestId('winner-announcement')
    expect(winnerAnnouncement.textContent?.toLowerCase()).toMatch(/hòa|tie/)
  })

  it('triggers onRematch and onBackToHub callbacks', () => {
    render(<DuelPodiumModal {...defaultProps} />)

    fireEvent.click(screen.getByTestId('rematch-button'))
    expect(defaultProps.onRematch).toHaveBeenCalled()

    fireEvent.click(screen.getByTestId('back-to-hub-button'))
    expect(defaultProps.onBackToHub).toHaveBeenCalled()
  })

  it('shows loading and disables rematch button when isRematching is true', () => {
    render(<DuelPodiumModal {...defaultProps} isRematching={true} />)
    const rematchBtn = screen.getByTestId('rematch-button')
    expect(rematchBtn.hasAttribute('disabled')).toBe(true)
    expect(rematchBtn.textContent).toContain('Đang tạo trận mới...')
  })
})

describe('Duel Arena Page (/duel/[code])', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession = { studentName: 'Minh' }
  })

  it('renders waiting lobby when duel status is waiting', async () => {
    const mockDuel: DuelState = {
      id: 'd1',
      code: 'DUEL88',
      topic: 'fruits',
      status: 'waiting',
      player1: { name: 'Minh', avatar: '🦊', score: 0, streak: 0 },
      currentQuestionIndex: 0,
      questions: [sampleQuestion],
    }

    vi.mocked(getDuelStateAction).mockResolvedValueOnce({
      success: true,
      data: mockDuel,
    })

    const paramsPromise = Promise.resolve({ code: 'DUEL88' })
    await act(async () => {
      render(<DuelArenaPage params={paramsPromise} />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('duel-waiting-room')).toBeDefined()
      expect(screen.getByText('DUEL88')).toBeDefined()
      expect(screen.getByText(/đang đợi đối thủ/i)).toBeDefined()
    })
  })

  it('renders arena in_progress with score bar and question card', async () => {
    const mockDuel: DuelState = {
      id: 'd2',
      code: 'DUEL99',
      topic: 'fruits',
      status: 'in_progress',
      player1: { name: 'Minh', avatar: '🦊', score: 100, streak: 1 },
      player2: { name: 'Linh', avatar: '🐼', score: 80, streak: 1 },
      currentQuestionIndex: 0,
      questions: [sampleQuestion],
    }

    vi.mocked(getDuelStateAction).mockResolvedValueOnce({
      success: true,
      data: mockDuel,
    })

    const paramsPromise = Promise.resolve({ code: 'DUEL99' })
    await act(async () => {
      render(<DuelArenaPage params={paramsPromise} />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('duel-score-bar')).toBeDefined()
      expect(screen.getByTestId('duel-question-card')).toBeDefined()
      expect(screen.getByText('Từ "Apple" có nghĩa là gì?')).toBeDefined()
    })
  })

  it('submits answer when option is clicked', async () => {
    const mockDuel: DuelState = {
      id: 'd3',
      code: 'DUEL77',
      topic: 'fruits',
      status: 'in_progress',
      player1: { name: 'Minh', avatar: '🦊', score: 0, streak: 0 },
      player2: { name: 'Linh', avatar: '🐼', score: 0, streak: 0 },
      currentQuestionIndex: 0,
      questions: [sampleQuestion],
    }

    vi.mocked(getDuelStateAction).mockResolvedValueOnce({
      success: true,
      data: mockDuel,
    })

    vi.mocked(submitDuelAnswerAction).mockResolvedValueOnce({
      success: true,
      data: {
        ...mockDuel,
        player1: { name: 'Minh', avatar: '🦊', score: 120, streak: 1 },
      },
    })

    const paramsPromise = Promise.resolve({ code: 'DUEL77' })
    await act(async () => {
      render(<DuelArenaPage params={paramsPromise} />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('duel-option-0')).toBeDefined()
    })

    fireEvent.click(screen.getByTestId('duel-option-0'))

    await waitFor(() => {
      expect(submitDuelAnswerAction).toHaveBeenCalledWith(
        expect.objectContaining({
          duelId: 'd3',
          questionIndex: 0,
          isCorrect: true,
          selectedOption: 'Quả táo',
        })
      )
    })
  })

  it('renders podium modal when duel status is finished', async () => {
    const mockDuel: DuelState = {
      id: 'd4',
      code: 'DUEL66',
      topic: 'fruits',
      status: 'finished',
      player1: { name: 'Minh', avatar: '🦊', score: 400, streak: 3 },
      player2: { name: 'Linh', avatar: '🐼', score: 250, streak: 1 },
      winnerName: 'Minh',
      currentQuestionIndex: 1,
      questions: [sampleQuestion],
    }

    vi.mocked(getDuelStateAction).mockResolvedValueOnce({
      success: true,
      data: mockDuel,
    })

    const paramsPromise = Promise.resolve({ code: 'DUEL66' })
    await act(async () => {
      render(<DuelArenaPage params={paramsPromise} />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('duel-podium-modal')).toBeDefined()
      expect(screen.getByTestId('winner-announcement').textContent).toContain('Minh')
    })
  })

  it('renders error state when room cannot be fetched', async () => {
    vi.mocked(getDuelStateAction).mockResolvedValueOnce({
      success: false,
      error: 'Không tìm thấy phòng thách đấu',
    })

    const paramsPromise = Promise.resolve({ code: 'INVALID' })
    await act(async () => {
      render(<DuelArenaPage params={paramsPromise} />)
    })

    await waitFor(() => {
      expect(screen.getByText('Không thể tải phòng')).toBeDefined()
      expect(screen.getByText('Không tìm thấy phòng thách đấu')).toBeDefined()
    })
  })

  it('renders ready countdown overlay when status is ready', async () => {
    const mockDuel: DuelState = {
      id: 'd5',
      code: 'DUEL55',
      topic: 'animals',
      status: 'ready',
      player1: { name: 'Minh', avatar: '🦊', score: 0, streak: 0 },
      player2: { name: 'Linh', avatar: '🐼', score: 0, streak: 0 },
      currentQuestionIndex: 0,
      questions: [sampleQuestion],
    }

    vi.mocked(getDuelStateAction).mockResolvedValueOnce({
      success: true,
      data: mockDuel,
    })

    const paramsPromise = Promise.resolve({ code: 'DUEL55' })
    await act(async () => {
      render(<DuelArenaPage params={paramsPromise} />)
    })

    await waitFor(() => {
      expect(screen.getByText('Đối thủ đã sẵn sàng!')).toBeDefined()
      expect(screen.getByText('Chuẩn bị tranh tài!')).toBeDefined()
    })
  })

  it('triggers rematch and navigates to new room from arena', async () => {
    const mockDuel: DuelState = {
      id: 'd6',
      code: 'DUEL44',
      topic: 'fruits',
      status: 'finished',
      player1: { name: 'Minh', avatar: '🦊', score: 300, streak: 2 },
      player2: { name: 'Linh', avatar: '🐼', score: 200, streak: 0 },
      winnerName: 'Minh',
      currentQuestionIndex: 1,
      questions: [sampleQuestion],
    }

    vi.mocked(getDuelStateAction).mockResolvedValueOnce({
      success: true,
      data: mockDuel,
    })

    vi.mocked(createRematchAction).mockResolvedValueOnce({
      success: true,
      data: {
        ...mockDuel,
        id: 'd-rematch',
        code: 'NEWREM',
        status: 'waiting',
      },
    })

    const paramsPromise = Promise.resolve({ code: 'DUEL44' })
    await act(async () => {
      render(<DuelArenaPage params={paramsPromise} />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('rematch-button')).toBeDefined()
    })

    fireEvent.click(screen.getByTestId('rematch-button'))

    await waitFor(() => {
      expect(createRematchAction).toHaveBeenCalledWith('d6', 'Minh')
      expect(mockPush).toHaveBeenCalledWith('/duel/NEWREM')
    })
  })
})
