// tests/unit/actions/auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSignInWithPassword = vi.fn()
const mockSignOut = vi.fn()
const mockUpdateUser = vi.fn()
const mockRedirect = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      updateUser: mockUpdateUser,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url)
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))

describe('Auth Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login action', () => {
    it('returns error when email is missing', async () => {
      const { login } = await import('@/app/actions/auth')
      const formData = new FormData()
      formData.append('password', 'password123')

      const result = await login(formData)
      expect(result).toEqual({ error: 'Email là bắt buộc' })
      expect(mockSignInWithPassword).not.toHaveBeenCalled()
    })

    it('returns error when password is missing', async () => {
      const { login } = await import('@/app/actions/auth')
      const formData = new FormData()
      formData.append('email', 'admin@gamehub.vn')

      const result = await login(formData)
      expect(result).toEqual({ error: 'Mật khẩu là bắt buộc' })
      expect(mockSignInWithPassword).not.toHaveBeenCalled()
    })

    it('returns error when authentication fails', async () => {
      const { login } = await import('@/app/actions/auth')
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      })

      const formData = new FormData()
      formData.append('email', 'admin@gamehub.vn')
      formData.append('password', 'wrong-pass')

      const result = await login(formData)
      expect(result).toEqual({ error: 'Email hoặc mật khẩu không chính xác' })
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'admin@gamehub.vn',
        password: 'wrong-pass',
      })
    })

    it('redirects to /admin/dashboard on successful login by default', async () => {
      const { login } = await import('@/app/actions/auth')
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'admin-1' }, session: {} },
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'admin@gamehub.vn')
      formData.append('password', 'validpassword123')

      await expect(login(formData)).rejects.toThrow('NEXT_REDIRECT:/admin/dashboard')
      expect(mockRedirect).toHaveBeenCalledWith('/admin/dashboard')
    })

    it('redirects to the specified redirect path on successful login', async () => {
      const { login } = await import('@/app/actions/auth')
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'admin-1' }, session: {} },
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'admin@gamehub.vn')
      formData.append('password', 'validpassword123')
      formData.append('redirect', '/admin/games/flashcard')

      await expect(login(formData)).rejects.toThrow('NEXT_REDIRECT:/admin/games/flashcard')
      expect(mockRedirect).toHaveBeenCalledWith('/admin/games/flashcard')
    })
  })

  describe('logout action', () => {
    it('signs out from Supabase and redirects to /login', async () => {
      const { logout } = await import('@/app/actions/auth')
      mockSignOut.mockResolvedValue({ error: null })

      await expect(logout()).rejects.toThrow('NEXT_REDIRECT:/login')
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('updatePassword action', () => {
    it('returns error when password has fewer than 8 characters', async () => {
      const { updatePassword } = await import('@/app/actions/auth')
      const result = await updatePassword('short')

      expect(result).toEqual({ error: 'Mật khẩu phải có ít nhất 8 ký tự' })
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })

    it('returns error when Supabase fails to update password', async () => {
      const { updatePassword } = await import('@/app/actions/auth')
      mockUpdateUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth session missing' },
      })

      const result = await updatePassword('newValidPassword123')
      expect(result).toEqual({ error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' })
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newValidPassword123' })
    })

    it('returns success true when password is updated successfully', async () => {
      const { updatePassword } = await import('@/app/actions/auth')
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: 'admin-1' } },
        error: null,
      })

      const result = await updatePassword('newValidPassword123')
      expect(result).toEqual({ success: true })
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newValidPassword123' })
    })
  })
})
