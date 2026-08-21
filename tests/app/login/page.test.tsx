// tests/app/login/page.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/login/page'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn((param: string) => (param === 'redirect' ? '/admin/dashboard' : null)),
  })),
}))

vi.mock('@/app/actions/auth', () => ({
  login: vi.fn(),
}))

describe('LoginPage Component', () => {
  it('renders login form with all required elements', () => {
    render(<LoginPage />)

    expect(
      screen.getByRole('heading', { name: /đăng nhập quản trị/i })
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /đăng nhập/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /quay lại trang chủ/i })
    ).toBeInTheDocument()
  })
})
