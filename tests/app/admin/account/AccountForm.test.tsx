// tests/app/admin/account/AccountForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AccountForm } from '@/app/admin/account/AccountForm'
import * as authActions from '@/app/actions/auth'

vi.mock('@/app/actions/auth', () => ({
  updatePassword: vi.fn(),
}))

describe('AccountForm Component', () => {
  it('renders password input fields and submit button', () => {
    render(<AccountForm />)

    expect(screen.getByLabelText(/^mật khẩu mới$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^xác nhận mật khẩu mới$/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /lưu mật khẩu mới/i })
    ).toBeInTheDocument()
  })

  it('validates password length client-side', async () => {
    render(<AccountForm />)

    fireEvent.change(screen.getByLabelText(/^mật khẩu mới$/i), {
      target: { value: '123' },
    })
    fireEvent.change(screen.getByLabelText(/^xác nhận mật khẩu mới$/i), {
      target: { value: '123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /lưu mật khẩu mới/i }))

    expect(
      await screen.findByText(/mật khẩu mới phải có ít nhất 8 ký tự/i)
    ).toBeInTheDocument()
    expect(authActions.updatePassword).not.toHaveBeenCalled()
  })

  it('validates password confirmation match', async () => {
    render(<AccountForm />)

    fireEvent.change(screen.getByLabelText(/^mật khẩu mới$/i), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText(/^xác nhận mật khẩu mới$/i), {
      target: { value: 'different123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /lưu mật khẩu mới/i }))

    expect(
      await screen.findByText(/xác nhận mật khẩu không khớp/i)
    ).toBeInTheDocument()
    expect(authActions.updatePassword).not.toHaveBeenCalled()
  })

  it('calls updatePassword and shows success message on valid submission', async () => {
    vi.mocked(authActions.updatePassword).mockResolvedValue({ success: true })
    render(<AccountForm />)

    fireEvent.change(screen.getByLabelText(/^mật khẩu mới$/i), {
      target: { value: 'newValidPassword123' },
    })
    fireEvent.change(screen.getByLabelText(/^xác nhận mật khẩu mới$/i), {
      target: { value: 'newValidPassword123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /lưu mật khẩu mới/i }))

    await waitFor(() => {
      expect(authActions.updatePassword).toHaveBeenCalledWith('newValidPassword123')
    })
    expect(
      await screen.findByText(/đổi mật khẩu thành công!/i)
    ).toBeInTheDocument()
  })
})
