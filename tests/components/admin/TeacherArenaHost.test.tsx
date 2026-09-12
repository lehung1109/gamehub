// tests/components/admin/TeacherArenaHost.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TeacherArenaHost } from '@/components/admin/arena/TeacherArenaHost'
import type { LiveArena, LiveArenaParticipant, ArenaQuestion } from '@/types/arena'

const mockAdvanceState = vi.fn()
const mockFinalizeArena = vi.fn()
const mockGetArenaById = vi.fn()

vi.mock('@/app/actions/arena', () => ({
  advanceArenaStateAction: (...args: unknown[]) => mockAdvanceState(...args),
  finalizeArenaAction: (...args: unknown[]) => mockFinalizeArena(...args),
  getLiveArenaByIdAction: (...args: unknown[]) => mockGetArenaById(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

const mockQuestions: ArenaQuestion[] = [
  {
    id: 'q1',
    question: 'Which animal is the largest land mammal?',
    options: ['African Elephant', 'Hippopotamus', 'White Rhinoceros', 'Giraffe'],
    correctAnswer: 'African Elephant',
    explanation: 'African elephants are the largest living land animals.',
    timeLimitSeconds: 15,
    points: 1000,
  },
]

const mockParticipants: LiveArenaParticipant[] = [
  {
    id: 'p1',
    arenaId: 'arena-host-1',
    studentName: 'Bé An',
    avatar: '🦊',
    score: 1800,
    streak: 2,
    answers: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'p2',
    arenaId: 'arena-host-1',
    studentName: 'Bé Bình',
    avatar: '🐼',
    score: 1200,
    streak: 1,
    answers: [],
    createdAt: '',
    updatedAt: '',
  },
]

const mockArena: LiveArena = {
  id: 'arena-host-1',
  pinCode: '749201',
  title: 'Vòng đấu Khoa học Tự nhiên',
  gameId: 'flashcard',
  questions: mockQuestions,
  status: 'lobby',
  currentQuestionIndex: 0,
  isActive: true,
  createdAt: '2026-09-12T12:00:00Z',
  updatedAt: '2026-09-12T12:00:00Z',
}

describe('TeacherArenaHost Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdvanceState.mockResolvedValue({ success: true })
    mockFinalizeArena.mockResolvedValue({
      success: true,
      podium: [
        { rank: 1, studentName: 'Bé An', avatar: '🦊', score: 1800, starsAwarded: 15, medalEmoji: '🥇' },
        { rank: 2, studentName: 'Bé Bình', avatar: '🐼', score: 1200, starsAwarded: 10, medalEmoji: '🥈' },
      ],
    })
    mockGetArenaById.mockResolvedValue({
      success: true,
      arena: mockArena,
      participants: mockParticipants,
    })
  })

  it('renders lobby screen with PIN code and joined participants', () => {
    render(
      <TeacherArenaHost
        initialArena={mockArena}
        initialParticipants={mockParticipants}
      />
    )

    expect(screen.getAllByText('749201').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Bé An')).toBeInTheDocument()
    expect(screen.getByText('Bé Bình')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bắt đầu trận đấu/i })).toBeInTheDocument()
  })

  it('allows teacher to start battle from lobby', async () => {
    render(
      <TeacherArenaHost
        initialArena={mockArena}
        initialParticipants={mockParticipants}
      />
    )

    const startBtn = screen.getByRole('button', { name: /bắt đầu trận đấu/i })
    fireEvent.click(startBtn)

    await waitFor(() => {
      expect(mockAdvanceState).toHaveBeenCalledWith('arena-host-1', 'in_progress', 0)
    })
  })

  it('renders in_progress question on smartboard view', () => {
    const inProgressArena: LiveArena = {
      ...mockArena,
      status: 'in_progress',
    }

    render(
      <TeacherArenaHost
        initialArena={inProgressArena}
        initialParticipants={mockParticipants}
      />
    )

    expect(screen.getByText('Which animal is the largest land mammal?')).toBeInTheDocument()
    expect(screen.getByText('African Elephant')).toBeInTheDocument()
    expect(screen.getByText('Hippopotamus')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hiện đáp án/i })).toBeInTheDocument()
  })

  it('renders podium when arena status is finished', () => {
    const finishedArena: LiveArena = {
      ...mockArena,
      status: 'finished',
    }

    render(
      <TeacherArenaHost
        initialArena={finishedArena}
        initialParticipants={mockParticipants}
      />
    )

    expect(screen.getByText(/bục trao giải/i)).toBeInTheDocument()
    expect(screen.getByText('Bé An')).toBeInTheDocument()
    expect(screen.getByText(/\+15 Sao/)).toBeInTheDocument()
  })
})
