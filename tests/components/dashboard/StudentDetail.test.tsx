// tests/components/dashboard/StudentDetail.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentDetail } from '@/components/dashboard/StudentDetail'
import type { StudentDashboardData } from '@/app/actions/classes'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

const mockStudentEmptyData: StudentDashboardData = {
  classroom: {
    id: 'class-1',
    teacher_id: 'teacher-123',
    name: 'Lớp 1A - Họa Mi',
    code: 'ABC123',
    is_active: true,
    created_at: '2026-08-20T00:00:00Z',
  },
  student: {
    id: 'student-1',
    classroom_id: 'class-1',
    name: 'Bé Minh',
    created_at: '2026-08-21T00:00:00Z',
  },
  totalSessions: 0,
  avgScorePercent: 0,
  mostPlayedGame: null,
  lastActiveAt: null,
  sessions: [],
  difficultWords: [],
  timeframe: 'all',
}

const mockStudentPopulatedData: StudentDashboardData = {
  classroom: {
    id: 'class-1',
    teacher_id: 'teacher-123',
    name: 'Lớp 1A - Họa Mi',
    code: 'ABC123',
    is_active: true,
    created_at: '2026-08-20T00:00:00Z',
  },
  student: {
    id: 'student-1',
    classroom_id: 'class-1',
    name: 'Bé Minh',
    created_at: '2026-08-21T00:00:00Z',
  },
  totalSessions: 5,
  avgScorePercent: 84,
  mostPlayedGame: {
    gameType: 'listening',
    gameLabel: 'Luyện nghe',
    sessionCount: 3,
  },
  lastActiveAt: '2026-08-22T11:00:00Z',
  sessions: [
    {
      id: 'sess-1',
      gameType: 'listening',
      gameLabel: 'Luyện nghe',
      topic: 'animals',
      score: 8,
      totalQuestions: 10,
      scorePercent: 80,
      startedAt: '2026-08-22T10:55:00Z',
      completedAt: '2026-08-22T11:00:00Z',
      details: [
        {
          id: 'd-1',
          sessionId: 'sess-1',
          prompt: 'giraffe',
          selectedAnswer: 'elephant',
          correctAnswer: 'giraffe',
          isCorrect: false,
          timeTakenMs: 2500,
          attempts: 1,
        },
        {
          id: 'd-2',
          sessionId: 'sess-1',
          prompt: 'monkey',
          selectedAnswer: 'monkey',
          correctAnswer: 'monkey',
          isCorrect: true,
          timeTakenMs: 1200,
          attempts: 1,
        },
      ],
    },
    {
      id: 'sess-2',
      gameType: 'flashcard',
      gameLabel: 'Thẻ từ vựng',
      topic: 'colors',
      score: null,
      totalQuestions: 12,
      scorePercent: 0,
      startedAt: '2026-08-22T09:50:00Z',
      completedAt: '2026-08-22T10:00:00Z',
      details: [],
    },
  ],
  difficultWords: [
    {
      prompt: 'giraffe',
      gameType: 'listening',
      gameLabel: 'Luyện nghe',
      topic: 'animals',
      incorrectCount: 2,
      totalAttempts: 3,
      accuracyPercent: 33,
    },
    {
      prompt: 'butterfly',
      gameType: 'spelling',
      gameLabel: 'Đánh vần',
      topic: 'insects',
      incorrectCount: 1,
      totalAttempts: 2,
      accuracyPercent: 50,
    },
  ],
  timeframe: 'all',
}

describe('StudentDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders student header info with back link to classroom dashboard', () => {
    render(<StudentDetail data={mockStudentPopulatedData} />)

    expect(screen.getByRole('heading', { name: /bé minh/i })).toBeInTheDocument()
    expect(screen.getAllByText(/lớp 1a - họa mi/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('ABC123')).toBeInTheDocument()

    const backLink = screen.getByRole('link', { name: /quay lại lớp/i })
    expect(backLink).toHaveAttribute('href', '/admin/dashboard/classes/class-1')
  })

  it('renders student KPI summary cards correctly', () => {
    render(<StudentDetail data={mockStudentPopulatedData} />)

    expect(screen.getByText('5')).toBeInTheDocument() // Total sessions
    expect(screen.getByText('84%')).toBeInTheDocument() // Avg score
    expect(screen.getAllByText(/luyện nghe/i).length).toBeGreaterThanOrEqual(1) // Most played game
  })

  it('renders empty state when student has 0 sessions', () => {
    render(<StudentDetail data={mockStudentEmptyData} />)

    expect(screen.getByText(/học sinh chưa có phiên chơi nào/i)).toBeInTheDocument()
  })

  it('renders celebratory state when student has sessions but 0 difficult words', () => {
    const perfectStudentData: StudentDashboardData = {
      ...mockStudentPopulatedData,
      difficultWords: [],
    }

    render(<StudentDetail data={perfectStudentData} />)

    expect(screen.getByText(/không có từ nào làm sai/i)).toBeInTheDocument()
  })

  it('renders top difficult words list with prompt, game type, and error count', () => {
    render(<StudentDetail data={mockStudentPopulatedData} />)

    expect(screen.getByText('Top từ hay sai nhất')).toBeInTheDocument()
    expect(screen.getByText('giraffe')).toBeInTheDocument()
    expect(screen.getByText('butterfly')).toBeInTheDocument()
    expect(screen.getByText('2 lần sai')).toBeInTheDocument()
    expect(screen.getByText('1 lần sai')).toBeInTheDocument()
  })

  it('renders session history list with scores and details', () => {
    render(<StudentDetail data={mockStudentPopulatedData} />)

    expect(screen.getByText(/lịch sử các phiên chơi/i)).toBeInTheDocument()
    expect(screen.getByText(/8\/10 câu \(80%\)/i)).toBeInTheDocument()
    expect(screen.getAllByText(/đã hoàn thành/i).length).toBeGreaterThanOrEqual(1)
  })

  it('allows expanding a session to inspect question-by-question breakdown', () => {
    render(<StudentDetail data={mockStudentPopulatedData} />)

    const expandButton = screen.getByRole('button', { name: /xem chi tiết câu hỏi/i })
    fireEvent.click(expandButton)

    // Verify question details are visible
    expect(screen.getAllByText('giraffe').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('monkey')).toBeInTheDocument()
    expect(screen.getByText(/đáp án của bé: elephant/i)).toBeInTheDocument()
    expect(screen.getByText(/đáp án đúng: giraffe/i)).toBeInTheDocument()
  })

  it('renders timeframe filter buttons and triggers router navigation on change', () => {
    render(<StudentDetail data={mockStudentPopulatedData} />)

    const sevenDaysBtn = screen.getByRole('button', { name: /7 ngày/i })
    fireEvent.click(sevenDaysBtn)

    expect(mockPush).toHaveBeenCalledWith('/admin/dashboard/classes/class-1/students/student-1?timeframe=7d')
  })
})
