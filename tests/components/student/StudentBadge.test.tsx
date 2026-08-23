import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentBadge } from '@/components/student/StudentBadge'
import { StudentSessionProvider, useStudentSession } from '@/hooks/use-student-session'

vi.mock('@/app/actions/student-progress', () => ({
  getStudentProgress: vi.fn().mockResolvedValue({
    success: true,
    totalStars: 0,
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
      <StudentBadge />
      {children}
    </StudentSessionProvider>
  )
}

describe('StudentBadge Component', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders student name and class name when student is logged in', async () => {
    render(
      <TestWrapper
        initialSession={{
          classCode: 'ABC123',
          studentName: 'Minh',
          className: 'Lớp 1A',
        }}
      />
    )

    expect(await screen.findByText(/Minh/i)).toBeInTheDocument()
    expect(screen.getByText(/Lớp 1A/i)).toBeInTheDocument()
  })

  it('opens session popup when badge is clicked', async () => {
    function PopupStatus() {
      const { isOpen } = useStudentSession()
      return <div data-testid="popup-state">{isOpen ? 'OPEN' : 'CLOSED'}</div>
    }

    render(
      <TestWrapper
        initialSession={{
          classCode: 'ABC123',
          studentName: 'Minh',
          className: 'Lớp 1A',
        }}
      >
        <PopupStatus />
      </TestWrapper>
    )

    expect(screen.getByTestId('popup-state')).toHaveTextContent('CLOSED')

    const badgeButton = await screen.findByRole('button', { name: /Minh/i })
    fireEvent.click(badgeButton)

    expect(screen.getByTestId('popup-state')).toHaveTextContent('OPEN')
  })

  it('renders anonymous indicator when playing anonymously', async () => {
    render(<TestWrapper initialAnonymous={true} />)

    expect(await screen.findByText(/Chơi tự do|Chơi ẩn danh/i)).toBeInTheDocument()
  })
})
