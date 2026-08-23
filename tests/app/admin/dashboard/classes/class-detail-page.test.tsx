// tests/app/admin/dashboard/classes/class-detail-page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClassDetailPage from '@/app/admin/dashboard/classes/[classId]/page'
import * as classActions from '@/app/actions/classes'

vi.mock('@/app/actions/classes', () => ({
  getClassDashboardAction: vi.fn(),
}))

vi.mock('@/components/dashboard/ClassOverview', () => ({
  ClassOverview: ({ data }: { data?: { classroom?: { name?: string }; totalStudents?: number } }) => (
    <div data-testid="class-overview-mock">
      Overview for: {data?.classroom?.name} - Students: {data?.totalStudents}
    </div>
  ),
}))

describe('Class Detail Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders ClassOverview when data is loaded successfully', async () => {
    const mockData = {
      classroom: { id: 'cls-1', name: 'Lớp 1A Mầm Non', code: 'ABC123', is_active: true },
      totalStudents: 10,
      totalSessions: 35,
    }

    vi.mocked(classActions.getClassDashboardAction).mockResolvedValue({
      data: mockData as unknown as classActions.ClassDashboardData,
    })

    const PageContent = await ClassDetailPage({
      params: Promise.resolve({ classId: 'cls-1' }),
      searchParams: Promise.resolve({ timeframe: '7d' }),
    })
    render(PageContent)

    expect(screen.getByTestId('class-overview-mock')).toBeInTheDocument()
    expect(screen.getByText(/overview for: lớp 1a mầm non - students: 10/i)).toBeInTheDocument()
    expect(classActions.getClassDashboardAction).toHaveBeenCalledWith('cls-1', '7d')
  })

  it('renders error state when class is not found or action fails', async () => {
    vi.mocked(classActions.getClassDashboardAction).mockResolvedValue({
      error: 'Không tìm thấy thông tin lớp học này',
    })

    const PageContent = await ClassDetailPage({
      params: Promise.resolve({ classId: 'invalid-id' }),
      searchParams: Promise.resolve({}),
    })
    render(PageContent)

    expect(screen.getByText(/không tìm thấy thông tin lớp học này/i)).toBeInTheDocument()
    const backLinks = screen.getAllByRole('link', { name: /quay lại danh sách lớp/i })
    expect(backLinks.length).toBeGreaterThanOrEqual(1)
    expect(backLinks[0]).toHaveAttribute('href', '/admin/dashboard/classes')
  })
})
