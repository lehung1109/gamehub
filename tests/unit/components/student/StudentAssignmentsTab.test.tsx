import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentAssignmentsTab } from '@/components/student/StudentAssignmentsTab'
import * as assignmentsAction from '@/app/actions/assignments'
import type { StudentAssignmentItem } from '@/types/assignments'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}))

vi.mock('@/app/actions/assignments', () => ({
  getStudentAssignments: vi.fn(),
}))

describe('StudentAssignmentsTab Component', () => {
  const defaultProps = {
    classCode: 'CLASS1',
    studentName: 'Bé An',
    onCloseModal: vi.fn(),
  }

  const mockAssignments: StudentAssignmentItem[] = [
    {
      id: 'asg-pending',
      classroom_id: 'c1',
      title: 'Ôn tập từ vựng Unit 1',
      description: 'Học 10 từ vựng chủ đề gia đình',
      game_type: 'flashcard',
      topic: 'family',
      config_id: null,
      target_score: 80,
      due_date: '2026-09-20T23:59:59Z',
      is_active: true,
      created_at: '2026-09-10T10:00:00Z',
      status: 'pending',
    },
    {
      id: 'asg-completed',
      classroom_id: 'c1',
      title: 'Thử thách bảng chữ cái',
      description: null,
      game_type: 'alphabet',
      topic: null,
      config_id: 'cfg-123',
      target_score: 50,
      due_date: '2026-09-25T23:59:59Z',
      is_active: true,
      created_at: '2026-09-10T10:00:00Z',
      status: 'completed',
      studentScore: 90,
    },
    {
      id: 'asg-overdue',
      classroom_id: 'c1',
      title: 'Kiểm tra nghe hiểu',
      description: 'Nghe và chọn đáp án đúng',
      game_type: 'listening',
      topic: null,
      config_id: null,
      target_score: 70,
      due_date: '2026-09-01T23:59:59Z',
      is_active: true,
      created_at: '2026-08-25T10:00:00Z',
      status: 'overdue',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading spinner initially', () => {
    vi.mocked(assignmentsAction.getStudentAssignments).mockReturnValue(
      new Promise(() => {}) // pending promise
    )

    render(<StudentAssignmentsTab {...defaultProps} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders empty state when no assignments found', async () => {
    vi.mocked(assignmentsAction.getStudentAssignments).mockResolvedValue({
      success: true,
      data: [],
    })

    render(<StudentAssignmentsTab {...defaultProps} />)

    expect(
      await screen.findByText('Chưa có bài tập nào được giao cho bạn.')
    ).toBeInTheDocument()
  })

  it('renders assignments with badges for completed, pending, and overdue', async () => {
    vi.mocked(assignmentsAction.getStudentAssignments).mockResolvedValue({
      success: true,
      data: mockAssignments,
    })

    render(<StudentAssignmentsTab {...defaultProps} />)

    // Check titles
    expect(await screen.findByText('Ôn tập từ vựng Unit 1')).toBeInTheDocument()
    expect(screen.getByText('Thử thách bảng chữ cái')).toBeInTheDocument()
    expect(screen.getByText('Kiểm tra nghe hiểu')).toBeInTheDocument()

    // Check descriptions
    expect(screen.getByText('Học 10 từ vựng chủ đề gia đình')).toBeInTheDocument()
    expect(screen.getByText('Nghe và chọn đáp án đúng')).toBeInTheDocument()

    // Check game titles from games.json
    expect(screen.getByText('Học từ vựng')).toBeInTheDocument() // flashcard
    expect(screen.getByText('Chữ cái & Phonics')).toBeInTheDocument() // alphabet
    expect(screen.getByText('Nghe hiểu')).toBeInTheDocument() // listening

    // Check status badges
    expect(screen.getByText('Chưa nộp')).toBeInTheDocument()
    expect(screen.getByText('Đã hoàn thành')).toBeInTheDocument()
    expect(screen.getByText('Quá hạn')).toBeInTheDocument()

    // Check target scores
    expect(screen.getByText(/Mục tiêu:\s*80\s*điểm/i)).toBeInTheDocument()
    expect(screen.getByText(/Mục tiêu:\s*50\s*điểm/i)).toBeInTheDocument()
    expect(screen.getByText(/Mục tiêu:\s*70\s*điểm/i)).toBeInTheDocument()

    // Check due dates rendered
    const dueDates = screen.getAllByText(/Hạn chót:/i)
    expect(dueDates.length).toBe(3)

    // Check action buttons text
    const playButtons = screen.getAllByRole('button', { name: /Làm bài ngay/i })
    expect(playButtons.length).toBe(2) // pending & overdue

    const retryButton = screen.getByRole('button', { name: /Luyện tập lại/i })
    expect(retryButton).toBeInTheDocument() // completed
  })

  it('clicking "Làm bài ngay" navigates to the game route and calls onCloseModal', async () => {
    vi.mocked(assignmentsAction.getStudentAssignments).mockResolvedValue({
      success: true,
      data: mockAssignments,
    })

    const onCloseModal = vi.fn()
    render(<StudentAssignmentsTab {...defaultProps} onCloseModal={onCloseModal} />)

    // Find the first "Làm bài ngay" button (for flashcard, topic=family)
    const playButtons = await screen.findAllByRole('button', { name: /Làm bài ngay/i })
    fireEvent.click(playButtons[0])

    expect(onCloseModal).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/games/flashcard?topic=family')

    // Find "Luyện tập lại" button (for alphabet, config_id=cfg-123)
    const retryButton = screen.getByRole('button', { name: /Luyện tập lại/i })
    fireEvent.click(retryButton)

    expect(onCloseModal).toHaveBeenCalledTimes(2)
    expect(mockPush).toHaveBeenCalledWith('/games/alphabet?configId=cfg-123')
  })

  it('renders error message and retry button when fetching fails', async () => {
    vi.mocked(assignmentsAction.getStudentAssignments).mockResolvedValue({
      success: false,
      error: 'Không thể kết nối đến máy chủ',
    })

    render(<StudentAssignmentsTab {...defaultProps} />)

    expect(await screen.findByText('Không thể kết nối đến máy chủ')).toBeInTheDocument()

    const retryButton = screen.getByRole('button', { name: /Thử lại/i })
    expect(retryButton).toBeInTheDocument()
  })
})
