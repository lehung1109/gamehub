import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateDuelModal } from '@/components/duel/CreateDuelModal'
import { JoinDuelModal } from '@/components/duel/JoinDuelModal'
import DuelHubPage from '@/app/duel/page'
import { createDuelRoomAction, joinDuelRoomAction } from '@/app/actions/duels'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

vi.mock('@/app/actions/duels', () => ({
  createDuelRoomAction: vi.fn(),
  joinDuelRoomAction: vi.fn(),
}))

vi.mock('@/components/student/DailyStreakBadge', () => ({
  DailyStreakBadge: () => <div data-testid="mock-daily-streak" />,
}))

vi.mock('@/components/student/MistakeNotebookBadge', () => ({
  MistakeNotebookBadge: () => <div data-testid="mock-mistake-badge" />,
}))

vi.mock('@/components/StudentProfileBadge', () => ({
  StudentProfileBadge: () => <div data-testid="mock-student-profile" />,
}))

vi.mock('@/components/student/StudentBadge', () => ({
  StudentBadge: () => <div data-testid="mock-student-badge" />,
}))

vi.mock('@/components/student/StudentJoinPopup', () => ({
  StudentJoinPopup: () => null,
}))

let mockSession: { studentName: string } | null = null
vi.mock('@/contexts/StudentSessionContext', () => ({
  useStudentSession: () => ({
    session: mockSession,
  }),
}))

describe('CreateDuelModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onCreated: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSession = { studentName: 'Học sinh A' }
  })

  it('renders nothing when isOpen is false', () => {
    render(<CreateDuelModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('create-duel-modal')).toBeNull()
  })

  it('renders modal elements and pre-populates player name from session', () => {
    render(<CreateDuelModal {...defaultProps} />)
    expect(screen.getByTestId('create-duel-modal')).toBeDefined()
    const nameInput = screen.getByTestId('player-name-input') as HTMLInputElement
    expect(nameInput.value).toBe('Học sinh A')
    expect(screen.getByTestId('create-duel-submit')).toBeDefined()
  })

  it('calls createDuelRoomAction and navigates on submit', async () => {
    vi.mocked(createDuelRoomAction).mockResolvedValueOnce({
      success: true,
      data: {
        id: 'duel-1',
        code: 'DUEL99',
        topic: 'animals',
        status: 'waiting',
        player1: { name: 'Học sinh A', avatar: '🦊', score: 0, streak: 0 },
        player1Answers: [],
        player2Answers: [],
        currentQuestionIndex: 0,
        questions: [],
        winnerName: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })

    render(<CreateDuelModal {...defaultProps} />)

    const submitBtn = screen.getByTestId('create-duel-submit')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(createDuelRoomAction).toHaveBeenCalledWith(
        expect.objectContaining({
          playerName: 'Học sinh A',
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/duel/DUEL99')
      expect(defaultProps.onCreated).toHaveBeenCalledWith('DUEL99')
    })
  })

  it('displays error message when creation fails', async () => {
    vi.mocked(createDuelRoomAction).mockResolvedValueOnce({
      success: false,
      error: 'Không thể tạo phòng thách đấu',
    })

    render(<CreateDuelModal {...defaultProps} />)
    const submitBtn = screen.getByTestId('create-duel-submit')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Không thể tạo phòng thách đấu')).toBeDefined()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('calls onClose when close button is clicked', () => {
    render(<CreateDuelModal {...defaultProps} />)
    const closeBtn = screen.getByLabelText(/đóng/i)
    fireEvent.click(closeBtn)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})

describe('JoinDuelModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onJoined: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSession = { studentName: 'Học sinh B' }
  })

  it('renders nothing when isOpen is false', () => {
    render(<JoinDuelModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('join-duel-modal')).toBeNull()
  })

  it('renders inputs and auto-uppercases room code', () => {
    render(<JoinDuelModal {...defaultProps} />)
    expect(screen.getByTestId('join-duel-modal')).toBeDefined()

    const codeInput = screen.getByTestId('room-code-input') as HTMLInputElement
    fireEvent.change(codeInput, { target: { value: 'abc123' } })
    expect(codeInput.value).toBe('ABC123')

    const nameInput = screen.getByTestId('join-player-name-input') as HTMLInputElement
    expect(nameInput.value).toBe('Học sinh B')
  })

  it('calls joinDuelRoomAction and navigates on success', async () => {
    vi.mocked(joinDuelRoomAction).mockResolvedValueOnce({
      success: true,
      data: {
        id: 'duel-1',
        code: 'XYZ456',
        topic: 'mixed',
        status: 'in_progress',
        player1: { name: 'Học sinh A', avatar: '🦊', score: 0, streak: 0 },
        player2: { name: 'Học sinh B', avatar: '🐼', score: 0, streak: 0 },
        player1Answers: [],
        player2Answers: [],
        currentQuestionIndex: 0,
        questions: [],
        winnerName: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })

    render(<JoinDuelModal {...defaultProps} />)

    const codeInput = screen.getByTestId('room-code-input')
    fireEvent.change(codeInput, { target: { value: 'xyz456' } })

    const submitBtn = screen.getByTestId('join-duel-submit')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(joinDuelRoomAction).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'XYZ456',
          playerName: 'Học sinh B',
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/duel/XYZ456')
      expect(defaultProps.onJoined).toHaveBeenCalledWith('XYZ456')
    })
  })

  it('displays error message when join fails', async () => {
    vi.mocked(joinDuelRoomAction).mockResolvedValueOnce({
      success: false,
      error: 'Phòng không tồn tại hoặc đã đủ người',
    })

    render(<JoinDuelModal {...defaultProps} />)

    const codeInput = screen.getByTestId('room-code-input')
    fireEvent.change(codeInput, { target: { value: 'XYZ456' } })

    const submitBtn = screen.getByTestId('join-duel-submit')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Phòng không tồn tại hoặc đã đủ người')).toBeDefined()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('calls onClose when close button is clicked', () => {
    render(<JoinDuelModal {...defaultProps} />)
    const closeBtn = screen.getByLabelText(/đóng/i)
    fireEvent.click(closeBtn)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})

describe('DuelHubPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession = { studentName: 'Học sinh Hub' }
  })

  it('renders duel hub container and action buttons', () => {
    render(<DuelHubPage />)
    expect(screen.getByTestId('duel-hub')).toBeDefined()
    expect(screen.getByTestId('open-create-modal')).toBeDefined()
    expect(screen.getByTestId('open-join-modal')).toBeDefined()
    expect(screen.getByText(/Đấu trường 1v1 - Thách đấu Tiếng Anh/i)).toBeDefined()
  })

  it('opens CreateDuelModal when clicking open-create-modal button', () => {
    render(<DuelHubPage />)
    expect(screen.queryByTestId('create-duel-modal')).toBeNull()

    fireEvent.click(screen.getByTestId('open-create-modal'))
    expect(screen.getByTestId('create-duel-modal')).toBeDefined()
  })

  it('opens JoinDuelModal when clicking open-join-modal button', () => {
    render(<DuelHubPage />)
    expect(screen.queryByTestId('join-duel-modal')).toBeNull()

    fireEvent.click(screen.getByTestId('open-join-modal'))
    expect(screen.getByTestId('join-duel-modal')).toBeDefined()
  })
})
