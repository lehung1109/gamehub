// tests/components/class/AssignmentManager.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AssignmentManager } from '@/components/class/AssignmentManager'
import * as assignmentsActions from '@/app/actions/assignments'
import type { AssignmentWithProgress } from '@/types/assignments'

vi.mock('@/app/actions/assignments', () => ({
  getClassAssignments: vi.fn(),
  createAssignment: vi.fn(),
  deleteAssignment: vi.fn(),
}))

const mockAssignments: AssignmentWithProgress[] = [
  {
    id: 'asg-1',
    classroom_id: 'cls-1',
    title: 'Bài tập 1: Luyện từ vựng',
    description: 'Luyện tập 10 từ vựng mỗi ngày',
    game_type: 'flashcard',
    topic: 'animals',
    config_id: null,
    target_score: 8,
    due_date: '2026-12-31T23:59:59.000Z',
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    completedCount: 3,
    totalStudentsCount: 5,
  },
  {
    id: 'asg-2',
    classroom_id: 'cls-1',
    title: 'Bài tập 2: Nghe hiểu',
    description: null,
    game_type: 'listening',
    topic: 'colors',
    config_id: null,
    target_score: 10,
    due_date: '2026-12-31T23:59:59.000Z',
    is_active: true,
    created_at: '2026-09-02T00:00:00.000Z',
    completedCount: 5,
    totalStudentsCount: 5,
  },
]

describe('AssignmentManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders assignments loaded from server action with student completion progress', async () => {
    vi.mocked(assignmentsActions.getClassAssignments).mockResolvedValue({
      success: true,
      data: mockAssignments,
    })

    render(<AssignmentManager classroomId="cls-1" classroomName="Lớp 1A" />)

    // Should show header title
    expect(screen.getByText('Nhiệm vụ & Bài tập về nhà')).toBeInTheDocument()

    // Wait for assignments to load
    await waitFor(() => {
      expect(screen.getByText('Bài tập 1: Luyện từ vựng')).toBeInTheDocument()
    })

    expect(screen.getByText('Bài tập 2: Nghe hiểu')).toBeInTheDocument()
    expect(screen.getByText('Luyện tập 10 từ vựng mỗi ngày')).toBeInTheDocument()

    // Progress text
    expect(screen.getByText(/Đã nộp: 3 \/ 5 học sinh/i)).toBeInTheDocument()
    expect(screen.getByText(/Đã nộp: 5 \/ 5 học sinh/i)).toBeInTheDocument()

    // Target score
    expect(screen.getByText(/8 điểm/i)).toBeInTheDocument()
    expect(screen.getByText(/10 điểm/i)).toBeInTheDocument()
  })

  it('renders empty state when no assignments exist', async () => {
    vi.mocked(assignmentsActions.getClassAssignments).mockResolvedValue({
      success: true,
      data: [],
    })

    render(<AssignmentManager classroomId="cls-1" classroomName="Lớp 1A" />)

    await waitFor(() => {
      expect(
        screen.getByText(/Chưa có bài tập nào được giao cho lớp này/i)
      ).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Tạo bài tập đầu tiên/i })).toBeInTheDocument()
  })

  it('opens create modal, submits new assignment, and calls createAssignment', async () => {
    vi.mocked(assignmentsActions.getClassAssignments).mockResolvedValue({
      success: true,
      data: [],
    })

    const newAssignment = {
      id: 'asg-new',
      classroom_id: 'cls-1',
      title: 'Bài tập ngữ pháp mới',
      description: 'Làm hết bài tập nhé',
      game_type: 'sentences',
      topic: 'tenses',
      config_id: null,
      target_score: 7,
      due_date: '2026-10-15T12:00:00.000Z',
      is_active: true,
      created_at: '2026-09-11T12:00:00.000Z',
      completedCount: 0,
      totalStudentsCount: 5,
    }

    vi.mocked(assignmentsActions.createAssignment).mockResolvedValue({
      success: true,
      data: newAssignment,
    })

    render(<AssignmentManager classroomId="cls-1" classroomName="Lớp 1A" />)

    await waitFor(() => {
      expect(
        screen.getByText(/Chưa có bài tập nào được giao cho lớp này/i)
      ).toBeInTheDocument()
    })

    // Open modal via button
    const openBtn = screen.getByRole('button', { name: /\+ Giao bài tập/i })
    fireEvent.click(openBtn)

    // Modal dialog should be displayed
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Giao bài tập mới')).toBeInTheDocument()

    // Fill form
    const titleInput = screen.getByLabelText(/Tiêu đề bài tập/i)
    fireEvent.change(titleInput, { target: { value: 'Bài tập ngữ pháp mới' } })

    const gameTypeSelect = screen.getByLabelText(/Trò chơi/i)
    fireEvent.change(gameTypeSelect, { target: { value: 'sentences' } })

    const topicInput = screen.getByLabelText(/Chủ đề/i)
    fireEvent.change(topicInput, { target: { value: 'tenses' } })

    const targetScoreInput = screen.getByLabelText(/Điểm mục tiêu/i)
    fireEvent.change(targetScoreInput, { target: { value: '7' } })

    const dueDateInput = screen.getByLabelText(/Hạn nộp/i)
    fireEvent.change(dueDateInput, { target: { value: '2026-10-15T12:00' } })

    const descriptionInput = screen.getByLabelText(/Mô tả/i)
    fireEvent.change(descriptionInput, { target: { value: 'Làm hết bài tập nhé' } })

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /^Giao bài tập$/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(assignmentsActions.createAssignment).toHaveBeenCalledWith({
        classroomId: 'cls-1',
        title: 'Bài tập ngữ pháp mới',
        gameType: 'sentences',
        topic: 'tenses',
        targetScore: 7,
        dueDate: '2026-10-15T12:00',
        description: 'Làm hết bài tập nhé',
      })
    })

    // Modal should close on success
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('calls deleteAssignment when delete button clicked', async () => {
    vi.mocked(assignmentsActions.getClassAssignments).mockResolvedValue({
      success: true,
      data: [...mockAssignments],
    })
    vi.mocked(assignmentsActions.deleteAssignment).mockResolvedValue({
      success: true,
    })

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<AssignmentManager classroomId="cls-1" classroomName="Lớp 1A" />)

    await waitFor(() => {
      expect(screen.getByText('Bài tập 1: Luyện từ vựng')).toBeInTheDocument()
    })

    // Find delete buttons
    const deleteBtns = screen.getAllByRole('button', { name: /Xóa/i })
    expect(deleteBtns.length).toBeGreaterThanOrEqual(1)

    fireEvent.click(deleteBtns[0])

    expect(confirmSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(assignmentsActions.deleteAssignment).toHaveBeenCalledWith('asg-1')
    })

    // asg-1 should be removed from the UI
    await waitFor(() => {
      expect(screen.queryByText('Bài tập 1: Luyện từ vựng')).not.toBeInTheDocument()
    })
  })

  it('does not call deleteAssignment if user cancels confirmation', async () => {
    vi.mocked(assignmentsActions.getClassAssignments).mockResolvedValue({
      success: true,
      data: [...mockAssignments],
    })

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<AssignmentManager classroomId="cls-1" classroomName="Lớp 1A" />)

    await waitFor(() => {
      expect(screen.getByText('Bài tập 1: Luyện từ vựng')).toBeInTheDocument()
    })

    const deleteBtns = screen.getAllByRole('button', { name: /Xóa/i })
    fireEvent.click(deleteBtns[0])

    expect(confirmSpy).toHaveBeenCalled()
    expect(assignmentsActions.deleteAssignment).not.toHaveBeenCalled()
    expect(screen.getByText('Bài tập 1: Luyện từ vựng')).toBeInTheDocument()
  })
})
