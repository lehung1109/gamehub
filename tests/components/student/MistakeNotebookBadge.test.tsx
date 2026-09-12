import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MistakeNotebookBadge } from '@/components/student/MistakeNotebookBadge'
import { StudentSessionProvider } from '@/contexts/StudentSessionContext'
import { saveStoredSrsDeck } from '@/lib/srs-storage'
import type { SrsCard } from '@/types/srs'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/app/actions/class-leaderboard', () => ({
  getClassLeaderboard: vi.fn().mockResolvedValue({ success: true, entries: [] }),
}))

vi.mock('@/app/actions/assignments', () => ({
  getStudentAssignments: vi.fn().mockResolvedValue({ success: true, data: [] }),
}))

vi.mock('@/app/actions/srs', () => ({
  getStudentSrsDeckAction: vi.fn().mockResolvedValue({
    success: true,
    deck: [],
    summary: { totalCards: 0, dueCount: 0, masteredCount: 0, learningCount: 0, reviewingCount: 0 },
  }),
  submitSrsReviewBatchAction: vi.fn().mockResolvedValue({ success: true, updatedCards: [], earnedStars: 0 }),
  syncSrsDeckAction: vi.fn().mockResolvedValue({ success: true }),
}))

const mockSession = {
  classCode: 'CLASS_TEST',
  studentName: 'Bé Lan',
  className: 'Lớp 2A',
}

function renderBadge(sessionData: Record<string, unknown> = mockSession) {
  sessionStorage.setItem(
    'gamehub_student_session',
    JSON.stringify({ ...sessionData, isAnonymous: false })
  )
  localStorage.setItem(
    'gamehub_student_session',
    JSON.stringify({ ...sessionData, isAnonymous: false })
  )

  return render(
    <StudentSessionProvider>
      <MistakeNotebookBadge />
    </StudentSessionProvider>
  )
}

describe('MistakeNotebookBadge Component', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders nothing when session is not present or user is anonymous', () => {
    // Case 1: No session in storage
    const { container, unmount } = render(
      <StudentSessionProvider>
        <MistakeNotebookBadge />
      </StudentSessionProvider>
    )
    expect(container.firstChild).toBeNull()
    unmount()

    // Case 2: Anonymous session
    sessionStorage.setItem('gamehub_student_session', JSON.stringify({ isAnonymous: true }))
    localStorage.setItem('gamehub_student_session', JSON.stringify({ isAnonymous: true }))

    const { container: anonContainer } = render(
      <StudentSessionProvider>
        <MistakeNotebookBadge />
      </StudentSessionProvider>
    )
    expect(anonContainer.firstChild).toBeNull()
  })

  it('renders nothing when mistake deck is empty', () => {
    saveStoredSrsDeck(mockSession.classCode, mockSession.studentName, [])
    const { container } = renderBadge()
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when all cards are scheduled for future review (dueCount === 0)', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString()
    const deck: SrsCard[] = [
      {
        id: 'vocab_banana',
        prompt: 'banana',
        correctAnswer: 'quả chuối',
        gameType: 'vocab',
        box: 2,
        lastReviewedAt: new Date().toISOString(),
        nextReviewAt: futureDate,
        mistakeCount: 1,
        successCount: 1,
        isMastered: false,
      },
    ]
    saveStoredSrsDeck(mockSession.classCode, mockSession.studentName, deck)

    const { container } = renderBadge()
    expect(container.firstChild).toBeNull()
  })

  it('renders badge with due count and pulsing red indicator dot when dueCount > 0', async () => {
    const pastDate = new Date(Date.now() - 3600000).toISOString()
    const deck: SrsCard[] = [
      {
        id: 'vocab_apple',
        prompt: 'apple',
        correctAnswer: 'quả táo',
        gameType: 'vocab',
        box: 1,
        lastReviewedAt: null,
        nextReviewAt: pastDate,
        mistakeCount: 1,
        successCount: 0,
        isMastered: false,
      },
      {
        id: 'vocab_cat',
        prompt: 'cat',
        correctAnswer: 'con mèo',
        gameType: 'vocab',
        box: 1,
        lastReviewedAt: null,
        nextReviewAt: pastDate,
        mistakeCount: 2,
        successCount: 0,
        isMastered: false,
      },
    ]
    saveStoredSrsDeck(mockSession.classCode, mockSession.studentName, deck)

    renderBadge()

    const badge = await screen.findByRole('button', { name: /Sổ tay từ vựng: 2 từ cần ôn/i })
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute(
      'title',
      'Bạn có 2 từ cần ôn tập trong Sổ tay! Bấm để ôn ngay.'
    )

    // Verify text
    expect(screen.getByTestId('mistake-due-count-text')).toHaveTextContent('2 từ cần ôn')

    // Verify indicator dot
    const dot = screen.getByTestId('mistake-indicator-dot')
    expect(dot).toBeInTheDocument()
  })

  it('opens StudentGamificationModal with initialTab="notebook" when badge is clicked', async () => {
    const pastDate = new Date(Date.now() - 3600000).toISOString()
    const deck: SrsCard[] = [
      {
        id: 'vocab_dog',
        prompt: 'dog',
        correctAnswer: 'con chó',
        gameType: 'vocab',
        box: 1,
        lastReviewedAt: null,
        nextReviewAt: pastDate,
        mistakeCount: 1,
        successCount: 0,
        isMastered: false,
      },
    ]
    saveStoredSrsDeck(mockSession.classCode, mockSession.studentName, deck)

    renderBadge()

    const badge = await screen.findByRole('button', { name: /Sổ tay từ vựng: 1 từ cần ôn/i })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(badge)

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Bảng Vàng & Thành Tích')).toBeInTheDocument()

    // Verify the notebook tab is selected
    const notebookTab = screen.getByRole('tab', { name: /Sổ tay/i })
    expect(notebookTab).toHaveAttribute('aria-selected', 'true')
  })

  it('closes modal when close button is clicked', async () => {
    const pastDate = new Date(Date.now() - 3600000).toISOString()
    const deck: SrsCard[] = [
      {
        id: 'vocab_sun',
        prompt: 'sun',
        correctAnswer: 'mặt trời',
        gameType: 'vocab',
        box: 1,
        lastReviewedAt: null,
        nextReviewAt: pastDate,
        mistakeCount: 1,
        successCount: 0,
        isMastered: false,
      },
    ]
    saveStoredSrsDeck(mockSession.classCode, mockSession.studentName, deck)

    renderBadge()

    const badge = await screen.findByRole('button', { name: /Sổ tay từ vựng: 1 từ cần ôn/i })
    fireEvent.click(badge)

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()

    const closeBtn = screen.getByRole('button', { name: 'Đóng' })
    fireEvent.click(closeBtn)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
