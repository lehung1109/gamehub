// src/app/admin/layout.tsx
import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, UserCircle, LogOut, ExternalLink, Gamepad2, School } from 'lucide-react'

export const metadata = {
  title: 'GameHub Admin | Quản trị',
  description: 'Hệ thống quản lý cấu hình game và tài khoản giáo viên',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5 font-bold text-lg text-indigo-700 hover:opacity-90 transition-opacity"
            >
              <div className="size-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Gamepad2 className="size-5" />
              </div>
              <span>GameHub Admin</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
              >
                <LayoutDashboard className="size-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/dashboard/classes"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
              >
                <School className="size-4" />
                <span>Lớp học</span>
              </Link>
              <Link
                href="/admin/account"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
              >
                <UserCircle className="size-4" />
                <span>Tài khoản</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <span>Xem trang học sinh</span>
              <ExternalLink className="size-3.5" />
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden lg:inline-block max-w-[160px] truncate">
                {user.email}
              </span>
              <form action={logout}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50 border-slate-200"
                >
                  <LogOut className="size-3.5 mr-1" />
                  <span>Đăng xuất</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        GameHub Admin &copy; {new Date().getFullYear()} — Nền tảng học tập tiếng Anh cho trẻ em
      </footer>
    </div>
  )
}
