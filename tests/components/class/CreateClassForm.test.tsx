// tests/components/class/CreateClassForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateClassForm } from '@/components/class/CreateClassForm'
import * as classActions from '@/app/actions/classes'

vi.mock('@/app/actions/classes', () => ({
  createClassAction: vi.fn(),
}))

const mockRouterRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRouterRefresh,
    push: vi.fn(),
  }),
}))

describe('CreateClassForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input for class name and submit button', () => {
    render(<CreateClassForm />)

    expect(screen.getByLabelText(/tên lớp/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tạo lớp/i })).toBeInTheDocument()
  })

  it('shows error if submitted with empty class name', async () => {
    render(<CreateClassForm />)

    fireEvent.click(screen.getByRole('button', { name: /tạo lớp/i }))

    expect(await screen.findByText(/vui lòng nhập tên lớp/i)).toBeInTheDocument()
    expect(classActions.createClassAction).not.toHaveBeenCalled()
  })

  it('shows error if class name exceeds 200 characters', async () => {
    render(<CreateClassForm />)

    fireEvent.change(screen.getByLabelText(/tên lớp/i), {
      target: { value: 'A'.repeat(201) },
    })
    fireEvent.click(screen.getByRole('button', { name: /tạo lớp/i }))

    expect(await screen.findByText(/không được vượt quá 200 ký tự/i)).toBeInTheDocument()
    expect(classActions.createClassAction).not.toHaveBeenCalled()
  })

  it('submits valid class name and calls onSuccess and displays created class code', async () => {
    const onSuccessMock = vi.fn()
    const createdClass = {
      id: 'cls-123',
      name: 'Lớp 1A - 2025',
      code: 'K9X2P4',
      is_active: true,
      teacher_id: 'teacher-1',
      created_at: new Date().toISOString(),
    }

    vi.mocked(classActions.createClassAction).mockResolvedValue({
      data: createdClass,
    })

    render(<CreateClassForm onSuccess={onSuccessMock} />)

    fireEvent.change(screen.getByLabelText(/tên lớp/i), {
      target: { value: 'Lớp 1A - 2025' },
    })
    fireEvent.click(screen.getByRole('button', { name: /tạo lớp/i }))

    await waitFor(() => {
      expect(classActions.createClassAction).toHaveBeenCalledWith({
        name: 'Lớp 1A - 2025',
      })
    })

    expect(await screen.findByText(/K9X2P4/)).toBeInTheDocument()
    expect(onSuccessMock).toHaveBeenCalledWith(createdClass)
  })

  it('displays server error message when action fails', async () => {
    vi.mocked(classActions.createClassAction).mockResolvedValue({
      error: 'Không thể tạo lớp học lúc này',
    })

    render(<CreateClassForm />)

    fireEvent.change(screen.getByLabelText(/tên lớp/i), {
      target: { value: 'Lớp 1B' },
    })
    fireEvent.click(screen.getByRole('button', { name: /tạo lớp/i }))

    expect(await screen.findByText(/không thể tạo lớp học lúc này/i)).toBeInTheDocument()
  })
})
