// tests/app/admin/dashboard/classes/student-detail-page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import StudentDetailPage from '@/app/admin/dashboard/classes/[classId]/students/[studentId]/page'
import * as classesActions from '@/app/actions/classes'

vi.mock('@/app/actions/classes', async (importOriginal) => {
  const original = await importOriginal<typeof classesActions>()
  return {
    ...original,
    getStudentDashboardAction: vi.fn(),
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('StudentDetailPage Server Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders error state when student or class is not found', async () => {
    vi.mocked(classesActions.getStudentDashboardAction).mockResolvedValue({
      error: 'Không tìm thấy thông tin học sinh này',
    })

    const Page = await StudentDetailPage({
      params: Promise.resolve({ classId: 'class-1', studentId: 'invalid-student' }),
      searchParams: Promise.resolve({ timeframe: 'all' }),
    })

    render(Page)

    expect(screen.getByText('Không thể tải thông tin học sinh')).toBeInTheDocument()
    expect(screen.getByText('Không tìm thấy thông tin học sinh này')).toBeInTheDocument()
    const backLinks = screen.getAllByRole('link', { name: /quay lại lớp học/i })
    expect(backLinks.length).toBeGreaterThanOrEqual(1)
    expect(backLinks[0]).toHaveAttribute('href', '/admin/dashboard/classes/class-1')
  })

  it('renders StudentDetail component when data is fetched successfully', async () => {
    vi.mocked(classesActions.getStudentDashboardAction).mockResolvedValue({
      data: {
        classroom: {
          id: 'class-1',
          teacher_id: 'teacher-123',
          name: 'Lớp 1A',
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
        totalSessions: 3,
        avgScorePercent: 85,
        mostPlayedGame: {
          gameType: 'listening',
          gameLabel: 'Luyện nghe',
          sessionCount: 2,
        },
        lastActiveAt: '2026-08-22T10:00:00Z',
        sessions: [],
        difficultWords: [],
        timeframe: 'all',
      },
    })

    const Page = await StudentDetailPage({
      params: Promise.resolve({ classId: 'class-1', studentId: 'student-1' }),
      searchParams: Promise.resolve({ timeframe: 'all' }),
    })

    render(Page)

    expect(screen.getByRole('heading', { name: /bé minh/i })).toBeInTheDocument()
    expect(screen.getByText('Lớp 1A')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })
})
