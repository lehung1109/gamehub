import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StudentGamificationModal } from '@/components/student/StudentGamificationModal'
import * as classLeaderboardAction from '@/app/actions/class-leaderboard'
import * as assignmentsAction from '@/app/actions/assignments'
import { getLevelInfo } from '@/lib/levels'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/app/actions/class-leaderboard', () => ({
  getClassLeaderboard: vi.fn(),
}))

vi.mock('@/app/actions/assignments', () => ({
  getStudentAssignments: vi.fn().mockResolvedValue({
    success: true,
    data: [],
  }),
}))

vi.mock('@/app/actions/srs', () => ({
  getStudentSrsDeckAction: vi.fn().mockResolvedValue({
    success: true,
    deck: [
      {
        id: 'wordle_sun',
        prompt: 'sun',
        correctAnswer: 'mặt trời',
        box: 1,
        lastReviewedAt: null,
        nextReviewAt: '2020-01-01T00:00:00Z',
        mistakeCount: 1,
        successCount: 0,
        isMastered: false,
      },
    ],
    summary: {
      totalCards: 1,
      dueCount: 1,
      masteredCount: 0,
      learningCount: 1,
      reviewingCount: 0,
    },
  }),
  submitSrsReviewBatchAction: vi.fn(),
  syncSrsDeckAction: vi.fn(),
}))

vi.mock('@/app/actions/reports', () => ({
  getMyCertificatesAction: vi.fn().mockResolvedValue({
    success: true,
    certificates: [],
    classroomName: 'Lớp 1A',
  }),
}))

describe('StudentGamificationModal Component', () => {
  const defaultLevelInfo = getLevelInfo(60) // Lv 2, 60 stars
  const mockOnClose = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    classCode: 'CLASS1',
    studentName: 'Bé An',
    totalStars: 60,
    levelInfo: defaultLevelInfo,
  }

  const mockLeaderboardEntries: classLeaderboardAction.LeaderboardEntry[] = [
    {
      rank: 1,
      studentId: 's1',
      studentName: 'Nguyễn Văn A',
      totalStars: 120,
      sessionsCount: 10,
      level: 2,
      levelBadge: '🐱',
      levelTitle: 'Khám phá',
      isCurrentStudent: false,
    },
    {
      rank: 2,
      studentId: 's2',
      studentName: 'Bé An',
      totalStars: 60,
      sessionsCount: 5,
      level: 2,
      levelBadge: '🐱',
      levelTitle: 'Khám phá',
      isCurrentStudent: true,
    },
    {
      rank: 3,
      studentId: 's3',
      studentName: 'Trần Thị C',
      totalStars: 40,
      sessionsCount: 3,
      level: 1,
      levelBadge: '🐣',
      levelTitle: 'Tập sự',
      isCurrentStudent: false,
    },
    {
      rank: 4,
      studentId: 's4',
      studentName: 'Lê Văn D',
      totalStars: 20,
      sessionsCount: 2,
      level: 1,
      levelBadge: '🐣',
      levelTitle: 'Tập sự',
      isCurrentStudent: false,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    vi.mocked(classLeaderboardAction.getClassLeaderboard).mockResolvedValue({
      success: true,
      classroomName: 'Lớp 1A',
      classCode: 'CLASS1',
      entries: mockLeaderboardEntries,
      currentStudentRank: 2,
    })
  })

  it('does not render when isOpen is false', () => {
    render(<StudentGamificationModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders modal header with title, studentName and classCode', async () => {
    render(<StudentGamificationModal {...defaultProps} />)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Bảng Vàng & Thành Tích')).toBeInTheDocument()
    expect(screen.getByText('Bé An • Lớp CLASS1')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    render(<StudentGamificationModal {...defaultProps} />)
    const closeBtn = await screen.findByRole('button', { name: /đóng/i })
    fireEvent.click(closeBtn)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', async () => {
    render(<StudentGamificationModal {...defaultProps} />)
    await screen.findByRole('dialog')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('loads and renders leaderboard entries and top 3 podium', async () => {
    render(<StudentGamificationModal {...defaultProps} />)

    await waitFor(() => {
      expect(classLeaderboardAction.getClassLeaderboard).toHaveBeenCalledWith({
        classCode: 'CLASS1',
        studentName: 'Bé An',
      })
    })

    // Top 3 Podium & List
    const rank1Matches = await screen.findAllByText('Nguyễn Văn A')
    expect(rank1Matches.length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('120 sao').length).toBeGreaterThanOrEqual(1)

    // Current student highlighted in list with (Bạn)
    const youBadges = screen.getAllByText('(Bạn)')
    expect(youBadges.length).toBeGreaterThan(0)

    // Rank 4 in full list
    expect(screen.getByText('Lê Văn D')).toBeInTheDocument()
    expect(screen.getByText('20 sao')).toBeInTheDocument()
  })

  it('shows empty state if leaderboard has no entries', async () => {
    vi.mocked(classLeaderboardAction.getClassLeaderboard).mockResolvedValue({
      success: true,
      classroomName: 'Lớp 1A',
      classCode: 'CLASS1',
      entries: [],
      currentStudentRank: null,
    })

    render(<StudentGamificationModal {...defaultProps} />)

    expect(await screen.findByText(/Chưa có dữ liệu bảng xếp hạng/i)).toBeInTheDocument()
  })

  it('shows error state if leaderboard fetch fails', async () => {
    vi.mocked(classLeaderboardAction.getClassLeaderboard).mockResolvedValue({
      success: false,
      entries: [],
      error: 'Lỗi kết nối máy chủ',
    })

    render(<StudentGamificationModal {...defaultProps} />)

    expect(await screen.findByText('Lỗi kết nối máy chủ')).toBeInTheDocument()
  })

  it('switches to Badges tab and renders unlocked and locked badges', async () => {
    // Set up 1 unlocked badge in localStorage
    localStorage.setItem(
      'gamehub_badges_v1_CLASS1_bé an',
      JSON.stringify([{ badgeId: 'first_step', unlockedAt: new Date().toISOString() }])
    )

    render(<StudentGamificationModal {...defaultProps} />)

    const badgesTab = screen.getByRole('tab', { name: /Huy hiệu/i })
    fireEvent.click(badgesTab)

    // Check badges counter
    expect(await screen.findByText(/Đã đạt được 1 \/ 8 huy hiệu/i)).toBeInTheDocument()

    // Check unlocked badge
    expect(screen.getByText('Bước đầu tiên')).toBeInTheDocument()
    expect(screen.getByText('Đã mở khóa')).toBeInTheDocument()

    // Check locked badges
    expect(screen.getByText('Ngôi sao sáng')).toBeInTheDocument()
    expect(screen.getAllByText('Chưa mở khóa').length).toBeGreaterThan(0)
  })

  it('switches to Levels tab and displays progress bar and level roadmap', async () => {
    render(<StudentGamificationModal {...defaultProps} />)

    const levelsTab = screen.getByRole('tab', { name: /Cấp độ/i })
    fireEvent.click(levelsTab)

    // Level info for Lv 2 (60 stars)
    const levelMatches = await screen.findAllByText(/Cấp 2: Khám phá/i)
    expect(levelMatches.length).toBeGreaterThan(0)
    expect(screen.getAllByText(/60 sao/i).length).toBeGreaterThan(0)

    // Level roadmap includes all 5 levels
    expect(screen.getByText(/Tập sự/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Khám phá/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Chinh phục/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Ngôi sao/i)).toBeInTheDocument()
    expect(screen.getByText(/Huyền thoại/i)).toBeInTheDocument()

    // Next level info
    expect(screen.getByText(/Cần thêm 90 sao để lên Chinh phục/i)).toBeInTheDocument()
  })

  it('displays max level message on Levels tab when at max level', async () => {
    const maxLevelInfo = getLevelInfo(500) // Lv 5 Huyền thoại
    render(
      <StudentGamificationModal
        {...defaultProps}
        totalStars={500}
        levelInfo={maxLevelInfo}
        initialTab="levels"
      />
    )

    expect(await screen.findByText(/Đã đạt cấp tối đa!/i)).toBeInTheDocument()
  })

  it('switches to Bài tập tab and renders assignments view', async () => {
    vi.mocked(assignmentsAction.getStudentAssignments).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'asg-test',
          classroom_id: 'c1',
          title: 'Bài tập về nhà 1',
          description: 'Luyện tập phát âm',
          game_type: 'alphabet',
          topic: null,
          config_id: null,
          target_score: 10,
          due_date: '2026-09-20T23:59:59Z',
          is_active: true,
          created_at: '2026-09-10T10:00:00Z',
          status: 'pending',
        },
      ],
    })

    render(<StudentGamificationModal {...defaultProps} />)

    const assignmentsTab = screen.getByRole('tab', { name: /Bài tập/i })
    fireEvent.click(assignmentsTab)

    expect(await screen.findByText('Bài tập về nhà 1')).toBeInTheDocument()
    expect(screen.getByText('Chưa nộp')).toBeInTheDocument()
  })

  it('switches to Sổ tay (notebook) tab and displays MistakeNotebookTab with due badge', async () => {
    // Seed 1 due card in storage
    localStorage.setItem(
      'gamehub_srs_deck_v1_CLASS1_bé an',
      JSON.stringify([
        {
          id: 'wordle_sun',
          prompt: 'sun',
          correctAnswer: 'mặt trời',
          box: 1,
          lastReviewedAt: null,
          nextReviewAt: '2020-01-01T00:00:00Z',
          mistakeCount: 1,
          successCount: 0,
          isMastered: false,
        },
      ])
    )

    render(<StudentGamificationModal {...defaultProps} />)

    // Check due badge on Sổ tay tab button
    const dueBadge = screen.getByTestId('notebook-due-badge')
    expect(dueBadge).toBeInTheDocument()
    expect(dueBadge).toHaveTextContent('1')

    // Click tab
    const notebookTab = screen.getByRole('tab', { name: /Sổ tay/i })
    fireEvent.click(notebookTab)

    expect(await screen.findByText(/Tổng số lỗi/i)).toBeInTheDocument()
    expect(screen.getByText('sun')).toBeInTheDocument()
  })

  it('switches to Bằng khen tab and renders StudentCertificatesTab', async () => {
    render(<StudentGamificationModal {...defaultProps} />)

    const certsTab = screen.getByRole('tab', { name: /Bằng khen/i })
    fireEvent.click(certsTab)

    expect(await screen.findByText(/Chưa có bằng khen nào/i)).toBeInTheDocument()
  })
})
