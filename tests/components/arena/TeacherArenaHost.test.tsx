// tests/components/arena/TeacherArenaHost.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TeacherArenaHost } from '@/components/admin/arena/TeacherArenaHost'
import type { LiveArena, LiveArenaParticipant, ArenaQuestion } from '@/types/arena'

const mockAdvanceState = vi.fn()
const mockFinalize = vi.fn()
const mockKick = vi.fn()
const mockExportHard = vi.fn()

vi.mock('@/app/actions/arena', () => ({
  advanceArenaStateAction: (...args: unknown[]) => mockAdvanceState(...args),
  finalizeArenaAction: (...args: unknown[]) => mockFinalize(...args),
  kickParticipantAction: (...args: unknown[]) => mockKick(...args),
  exportHardQuestionsToMistakeNotebookAction: (...args: unknown[]) => mockExportHard(...args),
  getLiveArenaByIdAction: vi.fn(),
}))

vi.mock('@/lib/arena/sound-engine', () => ({
  arenaSound: {
    playLobbyGroove: vi.fn(),
    stopLobbyGroove: vi.fn(),
    playCountdownTension: vi.fn(),
    playRevealDrumroll: vi.fn(),
    playPodiumCelebration: vi.fn(),
    isMuted: vi.fn().mockReturnValue(false),
    setMuted: vi.fn(),
  },
}))

const mockQuestion: ArenaQuestion = {
  id: 'q-1',
  question: 'What is the capital of Vietnam?',
  options: ['Hanoi', 'Saigon', 'Da Nang', 'Hue'],
  correctAnswer: 'Hanoi',
  explanation: 'Hanoi has been the capital of Vietnam since 1010.',
  timeLimitSeconds: 15,
  points: 1000,
  questionType: 'multiple_choice',
}

const mockArena: LiveArena = {
  id: 'arena-host-1',
  pinCode: '654321',
  title: 'Lớp 5A - Đấu Trường Trực Tiếp',
  gameId: 'flashcard',
  questions: [mockQuestion],
  status: 'lobby',
  currentQuestionIndex: 0,
  isActive: true,
  createdAt: '2026-09-13T10:00:00Z',
  updatedAt: '2026-09-13T10:00:00Z',
}

const mockParticipants: LiveArenaParticipant[] = [
  {
    id: 'p-1',
    arenaId: 'arena-host-1',
    studentName: 'Bảo Long',
    avatar: '🦁',
    score: 1200,
    streak: 2,
    answers: [{ questionIndex: 0, selectedOption: 'Hanoi', isCorrect: true, responseTimeMs: 1500, pointsEarned: 950 }],
    createdAt: '2026-09-13T10:01:00Z',
    updatedAt: '2026-09-13T10:01:00Z',
  },
  {
    id: 'p-2',
    arenaId: 'arena-host-1',
    studentName: 'TrollStudent',
    avatar: '👾',
    score: 0,
    streak: 0,
    answers: [],
    createdAt: '2026-09-13T10:01:10Z',
    updatedAt: '2026-09-13T10:01:10Z',
  },
]

describe('TeacherArenaHost Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdvanceState.mockResolvedValue({ success: true })
    mockFinalize.mockResolvedValue({ success: true, podium: [] })
    mockKick.mockResolvedValue({ success: true })
    mockExportHard.mockResolvedValue({ success: true, data: { exportedCount: 1, hardQuestions: [] } })
  })

  it('renders lobby screen with SVG QR code, room PIN, participants, and audio controls', () => {
    const { container } = render(
      <TeacherArenaHost
        initialArena={mockArena}
        initialParticipants={mockParticipants}
      />
    )

    // Check QR code container
    expect(screen.getByTestId('arena-qr-code')).toBeInTheDocument()
    expect(screen.getAllByText('654321').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Bảo Long')).toBeInTheDocument()
    expect(screen.getByText('TrollStudent')).toBeInTheDocument()

    // Fullscreen and sound toggle buttons exist
    expect(screen.getByRole('button', { name: /toàn màn hình/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /âm thanh/i })).toBeInTheDocument()

    // Verify zero forbidden typography classes
    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })

  it('allows teacher to kick disruptive participants in lobby', async () => {
    render(
      <TeacherArenaHost
        initialArena={mockArena}
        initialParticipants={mockParticipants}
      />
    )

    const kickButton = screen.getByTestId('kick-participant-TrollStudent')
    fireEvent.click(kickButton)

    await waitFor(() => {
      expect(mockKick).toHaveBeenCalledWith('arena-host-1', 'TrollStudent')
    })
  })

  it('renders live response histogram during in_progress round', () => {
    const inProgressArena: LiveArena = {
      ...mockArena,
      status: 'in_progress',
    }

    const { container } = render(
      <TeacherArenaHost
        initialArena={inProgressArena}
        initialParticipants={mockParticipants}
      />
    )

    expect(screen.getByText('What is the capital of Vietnam?')).toBeInTheDocument()
    expect(screen.getByTestId('response-histogram')).toBeInTheDocument()

    // Verify strict typography in in_progress view
    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
  })

  it('provides 1-click SRS export on podium finish screen', async () => {
    const finishedArena: LiveArena = {
      ...mockArena,
      status: 'finished',
    }

    const { container } = render(
      <TeacherArenaHost
        initialArena={finishedArena}
        initialParticipants={mockParticipants}
      />
    )

    const srsButton = screen.getByRole('button', { name: /lưu câu hỏi khó vào sổ tay/i })
    expect(srsButton).toBeInTheDocument()

    fireEvent.click(srsButton)

    await waitFor(() => {
      expect(mockExportHard).toHaveBeenCalledWith('arena-host-1')
    })

    // Verify strict typography in podium view
    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
  })
})
