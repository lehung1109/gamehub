import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentProfileBadge } from '@/components/StudentProfileBadge'
import { StudentSessionProvider } from '@/contexts/StudentSessionContext'
import * as studentProgressAction from '@/app/actions/student-progress'

vi.mock('@/app/actions/student-progress', () => ({
  getStudentProgress: vi.fn(),
}))

vi.mock('@/app/actions/class-leaderboard', () => ({
  getClassLeaderboard: vi.fn().mockResolvedValue({
    success: true,
    entries: [],
  }),
}))

function TestWrapper({
  children,
  initialSession,
  initialAnonymous = false,
}: {
  children?: React.ReactNode
  initialSession?: { classCode: string; studentName: string; className?: string }
  initialAnonymous?: boolean
}) {
  if (initialSession) {
    sessionStorage.setItem(
      'gamehub_student_session',
      JSON.stringify({ ...initialSession, isAnonymous: false })
    )
    localStorage.setItem(
      'gamehub_student_session',
      JSON.stringify({ ...initialSession, isAnonymous: false })
    )
  } else if (initialAnonymous) {
    sessionStorage.setItem(
      'gamehub_student_session',
      JSON.stringify({ isAnonymous: true })
    )
    localStorage.setItem(
      'gamehub_student_session',
      JSON.stringify({ isAnonymous: true })
    )
  } else {
    sessionStorage.clear()
    localStorage.clear()
  }

  return (
    <StudentSessionProvider>
      <StudentProfileBadge />
      {children}
    </StudentSessionProvider>
  )
}

describe('StudentProfileBadge Component', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders level info, badge emoji, and stars count for logged in student', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 60,
    })

    render(
      <TestWrapper
        initialSession={{
          classCode: 'ABC123',
          studentName: 'Bé An',
          className: 'Lớp 1A',
        }}
      />
    )

    const badge = await screen.findByTestId('student-profile-badge')
    expect(badge).toBeInTheDocument()

    // Level 2 (50+ stars): 🐱 Khám phá
    expect(await screen.findByText('Lv 2')).toBeInTheDocument()
    expect(screen.getByText('Khám phá')).toBeInTheDocument()
    expect(screen.getByTestId('level-badge-emoji')).toHaveTextContent('🐱')
    expect(screen.getByTestId('total-stars-count')).toHaveTextContent('60')
  })

  it('does not render badge when anonymous', async () => {
    render(<TestWrapper initialAnonymous={true} />)

    expect(screen.queryByTestId('student-profile-badge')).not.toBeInTheDocument()
  })

  it('does not render badge when no session exists', () => {
    render(<TestWrapper />)

    expect(screen.queryByTestId('student-profile-badge')).not.toBeInTheDocument()
  })

  it('has interactive accessibility attributes', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 60,
    })

    render(
      <TestWrapper
        initialSession={{
          classCode: 'ABC123',
          studentName: 'Bé An',
          className: 'Lớp 1A',
        }}
      />
    )

    const badge = await screen.findByTestId('student-profile-badge')
    expect(badge).toHaveAttribute('role', 'button')
    expect(badge).toHaveAttribute('tabindex', '0')
    expect(badge.className).toContain('cursor-pointer')
  })

  it('opens StudentGamificationModal when clicking badge', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 60,
    })

    render(
      <TestWrapper
        initialSession={{
          classCode: 'ABC123',
          studentName: 'Bé An',
          className: 'Lớp 1A',
        }}
      />
    )

    const badge = await screen.findByTestId('student-profile-badge')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(badge)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Bảng Vàng & Thành Tích')).toBeInTheDocument()
    expect(screen.getByText('Bé An • Lớp ABC123')).toBeInTheDocument()
  })

  it('opens StudentGamificationModal when pressing Enter or Space', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 60,
    })

    render(
      <TestWrapper
        initialSession={{
          classCode: 'ABC123',
          studentName: 'Bé An',
          className: 'Lớp 1A',
        }}
      />
    )

    const badge = await screen.findByTestId('student-profile-badge')
    fireEvent.keyDown(badge, { key: 'Enter' })

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Bảng Vàng & Thành Tích')).toBeInTheDocument()
  })
})
