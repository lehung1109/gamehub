import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StudentJoinPopup } from '@/components/student/StudentJoinPopup'
import { StudentSessionProvider, useStudentSession } from '@/hooks/use-student-session'
import * as classActions from '@/app/actions/classes'

vi.mock('@/app/actions/classes', () => ({
  validateClassCodeAction: vi.fn(),
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
      <StudentJoinPopup />
      {children}
    </StudentSessionProvider>
  )
}

describe('StudentJoinPopup Component', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders modal with class code, student name inputs, and action buttons when open', async () => {
    render(<TestWrapper />)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Tham gia lớp học/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mã lớp/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tên của bé/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Vào lớp/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bỏ qua/i })).toBeInTheDocument()
  })

  it('shows error when submitting empty fields', async () => {
    render(<TestWrapper />)

    const submitBtn = await screen.findByRole('button', { name: /Vào lớp/i })
    fireEvent.click(submitBtn)

    expect(await screen.findByText(/Bé vui lòng nhập mã lớp nhé!/i)).toBeInTheDocument()
  })

  it('shows error when student name is empty after entering code', async () => {
    render(<TestWrapper />)

    const codeInput = await screen.findByLabelText(/Mã lớp/i)
    fireEvent.change(codeInput, { target: { value: 'ABC123' } })

    const submitBtn = screen.getByRole('button', { name: /Vào lớp/i })
    fireEvent.click(submitBtn)

    expect(await screen.findByText(/Bé vui lòng nhập tên của mình nhé!/i)).toBeInTheDocument()
  })

  it('validates class code and joins class successfully on valid input', async () => {
    vi.mocked(classActions.validateClassCodeAction).mockResolvedValue({
      valid: true,
      classId: 'cls-123',
      className: 'Lớp 1A',
      classCode: 'ABC123',
    })

    render(<TestWrapper />)

    const codeInput = await screen.findByLabelText(/Mã lớp/i)
    const nameInput = screen.getByLabelText(/Tên của bé/i)
    const submitBtn = screen.getByRole('button', { name: /Vào lớp/i })

    fireEvent.change(codeInput, { target: { value: 'abc123' } })
    fireEvent.change(nameInput, { target: { value: 'Bé Minh' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(classActions.validateClassCodeAction).toHaveBeenCalledWith('ABC123')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    const stored = JSON.parse(sessionStorage.getItem('gamehub_student_session') || '{}')
    expect(stored.classCode).toBe('ABC123')
    expect(stored.studentName).toBe('Bé Minh')
    expect(stored.className).toBe('Lớp 1A')
  })

  it('shows friendly error message when class code is invalid or inactive', async () => {
    vi.mocked(classActions.validateClassCodeAction).mockResolvedValue({
      valid: false,
      error: 'Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍',
    })

    render(<TestWrapper />)

    const codeInput = await screen.findByLabelText(/Mã lớp/i)
    const nameInput = screen.getByLabelText(/Tên của bé/i)
    const submitBtn = screen.getByRole('button', { name: /Vào lớp/i })

    fireEvent.change(codeInput, { target: { value: 'WRONG9' } })
    fireEvent.change(nameInput, { target: { value: 'Bé Minh' } })
    fireEvent.click(submitBtn)

    expect(
      await screen.findByText('Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍')
    ).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('handles "Bỏ qua" / skip button by setting anonymous mode and closing dialog', async () => {
    render(<TestWrapper />)

    const skipBtn = await screen.findByRole('button', { name: /Bỏ qua/i })
    fireEvent.click(skipBtn)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    const stored = JSON.parse(sessionStorage.getItem('gamehub_student_session') || '{}')
    expect(stored.isAnonymous).toBe(true)
  })

  it('pre-fills existing session data when opened in edit mode', async () => {
    function EditTrigger() {
      const { setOpen } = useStudentSession()
      return <button onClick={() => setOpen(true)}>Mở đổi thông tin</button>
    }

    render(
      <TestWrapper
        initialSession={{
          classCode: 'XYZ789',
          studentName: 'Bé An',
          className: 'Lớp 2A',
        }}
      >
        <EditTrigger />
      </TestWrapper>
    )

    // Initially popup is closed because session exists
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Trigger open
    const openBtn = screen.getByText('Mở đổi thông tin')
    fireEvent.click(openBtn)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/Mã lớp/i)).toHaveValue('XYZ789')
    expect(screen.getByLabelText(/Tên của bé/i)).toHaveValue('Bé An')
  })
})
