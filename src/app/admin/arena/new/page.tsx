// src/app/admin/arena/new/page.tsx

import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeacherArenaCreate } from '@/components/admin/arena/TeacherArenaCreate'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tạo Phòng Đấu Trường | GameHub Admin',
  description: 'Tạo phòng thi đấu trắc nghiệm thời gian thực cho lớp học',
}

export default async function AdminArenaNewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <TeacherArenaCreate />
    </div>
  )
}
