// tests/components/arena/StudentArenaPlay.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StudentArenaPlay } from '@/components/arena/StudentArenaPlay'
import type { LiveArena, ArenaQuestion } from '@/types/arena'

const mockSubmitAnswer = vi.fn()

vi.mock('@/app/actions/arena', () => ({
  submitArenaAnswerAction: (...args: unknown[]) => mockSubmitAnswer(...args),
  getLiveArenaByPinAction: vi.fn(),
}))

vi.mock('@/lib/arena/sound-engine', () => ({
  arenaSound: {
    playAnswerSubmitChime: vi.fn(),
    isMuted: vi.fn().mockReturnValue(false),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

const mockQuestion: ArenaQuestion = {
  id: 'q-1',
  question: 'What color is a ripe banana?',
  options: ['Yellow', 'Blue', 'Purple', 'Red'],
  correctAnswer: 'Yellow',
  explanation: 'Bananas are yellow when ripe.',
  timeLimitSeconds: 15,
  points: 1000,
  questionType: 'multiple_choice',
}

const mockArena: LiveArena = {
  id: 'arena-test-1',
  pinCode: '749201',
  title: 'Thử thách Từ vựng',
  gameId: 'flashcard',
  questions: [mockQuestion],
  status: 'lobby',
  currentQuestionIndex: 0,
  isActive: true,
  createdAt: '2026-09-12T12:00:00Z',
  updatedAt: '2026-09-12T12:00:00Z',
}

describe('StudentArenaPlay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSubmitAnswer.mockResolvedValue({
      success: true,
      isCorrect: true,
      pointsEarned: 950,
      newStreak: 2,
      totalScore: 950,
      correctAnswer: 'Yellow',
    })
  })

  it('renders lobby waiting state with >= 16px typography', () => {
    const { container } = render(
      <StudentArenaPlay
        initialArena={mockArena}
        studentName="Bé An"
        avatar="🦊"
      />
    )

    expect(screen.getByText(/đã vào phòng đấu/i)).toBeInTheDocument()
    expect(screen.getByText('Bé An')).toBeInTheDocument()
    expect(screen.getByText('🦊')).toBeInTheDocument()
    expect(screen.getByText(/đang chờ thầy cô bắt đầu/i)).toBeInTheDocument()

    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
  })

  it('renders in_progress question and Kahoot-style options', () => {
    const inProgressArena: LiveArena = {
      ...mockArena,
      status: 'in_progress',
    }

    const { container } = render(
      <StudentArenaPlay
        initialArena={inProgressArena}
        studentName="Bé An"
        avatar="🦊"
      />
    )

    expect(screen.getByText('What color is a ripe banana?')).toBeInTheDocument()
    expect(screen.getByText('Yellow')).toBeInTheDocument()
    expect(screen.getByText('Blue')).toBeInTheDocument()
    expect(screen.getByText('Purple')).toBeInTheDocument()
    expect(screen.getByText('Red')).toBeInTheDocument()

    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
  })

  it('renders True/False format with 2 large tactile buttons', () => {
    const tfQuestion: ArenaQuestion = {
      id: 'q-tf',
      question: 'Water is dry.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      timeLimitSeconds: 15,
      points: 1000,
      questionType: 'true_false',
    }

    const tfArena: LiveArena = {
      ...mockArena,
      questions: [tfQuestion],
      status: 'in_progress',
    }

    render(
      <StudentArenaPlay
        initialArena={tfArena}
        studentName="Bé An"
        avatar="🦊"
      />
    )

    expect(screen.getByRole('button', { name: /true/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /false/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('submits answer and triggers haptic vibration when available', async () => {
    const mockVibrate = vi.fn()
    vi.stubGlobal('navigator', {
      ...navigator,
      vibrate: mockVibrate,
    })

    const inProgressArena: LiveArena = {
      ...mockArena,
      status: 'in_progress',
    }

    render(
      <StudentArenaPlay
        initialArena={inProgressArena}
        studentName="Bé An"
        avatar="🦊"
      />
    )

    const yellowOption = screen.getByRole('button', { name: /yellow/i })
    fireEvent.click(yellowOption)

    expect(mockVibrate).toHaveBeenCalledWith([40, 30, 40])

    await waitFor(() => {
      expect(mockSubmitAnswer).toHaveBeenCalledWith(
        expect.objectContaining({
          arenaId: 'arena-test-1',
          studentName: 'Bé An',
          questionIndex: 0,
          selectedOption: 'Yellow',
        })
      )
    })
  })

  it('renders finished podium screen with strict typography', () => {
    const finishedArena: LiveArena = {
      ...mockArena,
      status: 'finished',
    }

    const { container } = render(
      <StudentArenaPlay
        initialArena={finishedArena}
        studentName="Bé An"
        avatar="🦊"
      />
    )

    expect(screen.getByText(/kết thúc trận đấu/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /về trang chủ/i })).toBeInTheDocument()

    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
  })
})
