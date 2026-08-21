'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function isValidAdminRedirect(path: string | null): boolean {
  if (!path) return false
  return (
    (path === '/admin' || path.startsWith('/admin/')) &&
    !path.startsWith('//')
  )
}

export async function login(formData: FormData): Promise<{ error?: string } | void> {
  const email = (formData.get('email') as string | null)?.trim()
  const password = formData.get('password') as string | null
  const redirectPath = formData.get('redirect') as string | null

  if (!email) {
    return { error: 'Email là bắt buộc' }
  }

  if (!password) {
    return { error: 'Mật khẩu là bắt buộc' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Email hoặc mật khẩu không chính xác' }
  }

  const target = isValidAdminRedirect(redirectPath)
    ? redirectPath!
    : '/admin/dashboard'

  redirect(target)
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function updatePassword(
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 8) {
    return { error: 'Mật khẩu phải có ít nhất 8 ký tự' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    if (error.message.toLowerCase().includes('session')) {
      return { error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' }
    }
    return { error: error.message }
  }

  return { success: true }
}
