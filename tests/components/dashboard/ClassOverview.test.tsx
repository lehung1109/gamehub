// tests/components/dashboard/ClassOverview.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClassOverview } from '@/components/dashboard/ClassOverview'
import type { ClassDashboardData } from '@/app/actions/classes'
import * as clipboard from '@/lib/clipboard'

vi.mock('@/lib/clipboard', () => ({
  copyToClipboard: vi.fn().mockResolvedValue(true),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

const mockEmptyData: ClassDashboardData = {
  classroom: {
    id: 'class-1',
    teacher_id: 'teacher-123',
    name: 'Lớp 1A - Họa Mi',
    code: 'ABC123',
    is_active: true,
    created_at: '2026-08-20T00:00:00Z',
  },
  totalStudents: 0,
  totalSessions: 0,
  overallAvgScorePercent: 0,
  mostPlayedGame: null,
  gameStats: [],
  students: [],
  recentSessions: [],
  timeframe: 'all',
}

const mockPopulatedData: ClassDashboardData = {
  classroom: {
    id: 'class-1',
    teacher_id: 'teacher-123',
    name: 'Lớp 1A - Họa Mi',
    code: 'ABC123',
    is_active: true,
    created_at: '2026-08-20T00:00:00Z',
  },
  totalStudents: 5,
  totalSessions: 20,
  overallAvgScorePercent: 82,
  mostPlayedGame: {
    gameType: 'listening',
    gameLabel: 'Luyện nghe',
    sessionCount: 12,
  },
  gameStats: [
    {
      gameType: 'listening',
      gameLabel: 'Luyện nghe',
      sessionCount: 12,
      avgScorePercent: 85,
      totalScore: 102,
      totalQuestions: 120,
    },
    {
      gameType: 'spelling',
      gameLabel: 'Đánh vần',
      sessionCount: 8,
      avgScorePercent: 78,
      totalScore: 62,
      totalQuestions: 80,
    },
  ],
  students: [
    {
      id: 's1',
      name: 'Bé Lan',
      sessionCount: 8,
      avgScorePercent: 90,
      lastActiveAt: '2026-08-22T10:00:00Z',
    },
    {
      id: 's2',
      name: 'Bé Minh',
      sessionCount: 6,
      avgScorePercent: 75,
      lastActiveAt: '2026-08-22T09:30:00Z',
    },
  ],
  recentSessions: [
    {
      id: 'sess-1',
      studentId: 's1',
      studentName: 'Bé Lan',
      gameType: 'listening',
      gameLabel: 'Luyện nghe',
      topic: 'animals',
      score: 9,
      totalQuestions: 10,
      scorePercent: 90,
      completedAt: '2026-08-22T10:00:00Z',
    },
  ],
  timeframe: 'all',
}

describe('ClassOverview Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders classroom header info (name, code, active status, back link)', () => {
    render(<ClassOverview data={mockPopulatedData} />)

    expect(screen.getByRole('heading', { name: /lớp 1a - họa mi/i })).toBeInTheDocument()
    expect(screen.getByText('ABC123')).toBeInTheDocument()
    expect(screen.getByText(/đang hoạt động/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /danh sách lớp/i })).toHaveAttribute(
      'href',
      '/admin/dashboard/classes'
    )
  })

  it('allows copying class code with visual feedback', async () => {
    render(<ClassOverview data={mockPopulatedData} />)

    const copyBtn = screen.getAllByRole('button', { name: /sao chép mã/i })[0]
    fireEvent.click(copyBtn)

    expect(clipboard.copyToClipboard).toHaveBeenCalledWith('ABC123')
    await waitFor(() => {
      expect(screen.getByText(/đã sao chép/i)).toBeInTheDocument()
    })
  })

  it('renders friendly empty state when there are 0 sessions', () => {
    render(<ClassOverview data={mockEmptyData} />)

    expect(screen.getByText(/chưa có lượt chơi nào/i)).toBeInTheDocument()
    expect(screen.getByText(/hướng dẫn học sinh tham gia/i)).toBeInTheDocument()
    expect(screen.getAllByText('ABC123').length).toBeGreaterThanOrEqual(1)
  })

  it('renders summary KPI stat cards when data exists', () => {
    render(<ClassOverview data={mockPopulatedData} />)

    // 5 students, 20 sessions, 82% avg, most played: Luyện nghe
    expect(screen.getByText('5')).toBeInTheDocument() // total students
    expect(screen.getByText('20')).toBeInTheDocument() // total sessions
    expect(screen.getByText('82%')).toBeInTheDocument() // avg score
    expect(screen.getAllByText(/luyện nghe/i).length).toBeGreaterThanOrEqual(1) // most played
  })

  it('renders game breakdown stats with session count and percentage', () => {
    render(<ClassOverview data={mockPopulatedData} />)

    expect(screen.getByText('Điểm trung bình theo từng game')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument() // Listening avg
    expect(screen.getByText('78%')).toBeInTheDocument() // Spelling avg
    expect(screen.getAllByText(/12 lượt chơi/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/8 lượt chơi/i)).toBeInTheDocument()
  })

  it('renders student list table with links to student details', () => {
    render(<ClassOverview data={mockPopulatedData} />)

    expect(screen.getAllByText('Bé Lan').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Bé Minh')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()

    const detailLinks = screen.getAllByRole('link', { name: /xem chi tiết/i })
    expect(detailLinks.length).toBeGreaterThanOrEqual(2)
    expect(detailLinks[0]).toHaveAttribute(
      'href',
      '/admin/dashboard/classes/class-1/students/s1'
    )
  })

  it('renders recent sessions activity list', () => {
    render(<ClassOverview data={mockPopulatedData} />)

    expect(screen.getByText(/hoạt động gần đây/i)).toBeInTheDocument()
    expect(screen.getByText(/9\/10 câu/i)).toBeInTheDocument()
  })

  it('renders timeframe selector (Tất cả, 7 ngày qua, 30 ngày qua)', () => {
    render(<ClassOverview data={mockPopulatedData} />)

    expect(screen.getByRole('button', { name: /tất cả/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /7 ngày/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /30 ngày/i })).toBeInTheDocument()
  })

  it('filters students list when search input is used', () => {
    const dataWithManyStudents = {
      ...mockPopulatedData,
      students: [
        { id: 's1', name: 'Bé Lan', sessionCount: 2, avgScorePercent: 90, lastActiveAt: null },
        { id: 's2', name: 'Bé Minh', sessionCount: 1, avgScorePercent: 80, lastActiveAt: null },
        { id: 's3', name: 'Bé Tuấn', sessionCount: 3, avgScorePercent: 70, lastActiveAt: null },
        { id: 's4', name: 'Bé Trang', sessionCount: 4, avgScorePercent: 85, lastActiveAt: null },
      ],
    }

    render(<ClassOverview data={dataWithManyStudents} />)

    const searchInput = screen.getByPlaceholderText(/tìm học sinh/i)
    fireEvent.change(searchInput, { target: { value: 'Minh' } })

    expect(screen.getByText('Bé Minh')).toBeInTheDocument()
    expect(screen.queryByText('Bé Tuấn')).not.toBeInTheDocument()
  })

  it('renders non-scored sessions with "Đã hoàn thành" status', () => {
    const dataWithNonScored = {
      ...mockPopulatedData,
      recentSessions: [
        {
          id: 'sess-non-scored',
          studentId: 's1',
          studentName: 'Bé Lan',
          gameType: 'flashcard',
          gameLabel: 'Thẻ từ vựng',
          topic: 'animals',
          score: null,
          totalQuestions: 10,
          scorePercent: 0,
          completedAt: '2026-08-22T10:00:00Z',
        },
      ],
    }

    render(<ClassOverview data={dataWithNonScored} />)

    expect(screen.getByText('Đã hoàn thành')).toBeInTheDocument()
  })
})
