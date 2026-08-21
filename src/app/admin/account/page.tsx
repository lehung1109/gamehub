// src/app/admin/account/page.tsx
import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountForm } from './AccountForm'
import { UserCircle, Shield, Mail, Calendar } from 'lucide-react'

export const metadata = {
  title: 'Quản lý Tài khoản | GameHub Admin',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const createdDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Chưa cập nhật'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Tài khoản</h1>
        <p className="text-slate-500 text-sm mt-1">
          Xem thông tin giáo viên và thay đổi mật khẩu đăng nhập hệ thống
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details */}
        <Card className="md:col-span-1 border-slate-200 bg-white">
          <CardHeader>
            <div className="size-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
              <UserCircle className="size-7" />
            </div>
            <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
            <CardDescription className="text-xs">
              Quyền quản trị viên hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="size-4 text-slate-400 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Shield className="size-4 text-indigo-600 shrink-0" />
              <span className="font-medium text-indigo-700">Admin (Giáo viên)</span>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-xs pt-2 border-t border-slate-100">
              <Calendar className="size-3.5 text-slate-400 shrink-0" />
              <span>Tạo lúc: {createdDate}</span>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="md:col-span-2 border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Đổi mật khẩu</CardTitle>
            <CardDescription className="text-xs">
              Mật khẩu mới phải có tối thiểu 8 ký tự để đảm bảo an toàn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
