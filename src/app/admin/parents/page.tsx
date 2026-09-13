// src/app/admin/parents/page.tsx

import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClassParentsListAction, getClassAnnouncementsAction } from '@/app/actions/parent'
import { ParentsClientContainer } from '@/components/admin/ParentsClientContainer'
import { School, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Quản Lý Phụ Huynh & Bảng Thông Báo | GameHub Admin',
  description: 'Quản lý mã PIN, liên kết phụ huynh và đăng tải thông báo dặn dò cho lớp học.',
}

interface AdminParentsPageProps {
  searchParams: Promise<{ classId?: string }>
}

export default async function AdminParentsPage({ searchParams }: AdminParentsPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedSearchParams = await searchParams
  const selectedParamClassId = resolvedSearchParams?.classId

  // Fetch teacher's active classrooms
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('id, name, code')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  if (!classrooms || classrooms.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-6">
        <div className="size-20 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-4xl">
          <School className="size-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">
            Chưa có lớp học nào được tạo
          </h1>
          <p className="text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            Để quản lý mã PIN phụ huynh và gửi thông báo, Thầy/Cô cần tạo ít nhất một lớp học và thêm học sinh vào lớp.
          </p>
        </div>

        <div>
          <Link
            href="/admin/dashboard/classes"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-base hover:bg-indigo-700 shadow-md transition-colors"
          >
            <Plus className="size-5" />
            <span>Tạo lớp học mới ngay</span>
          </Link>
        </div>
      </div>
    )
  }

  const currentClass =
    classrooms.find((c) => c.id === selectedParamClassId) || classrooms[0]

  // Fetch parent access & announcements for this classroom
  const [parentDataResult, announcementsResult] = await Promise.all([
    getClassParentsListAction(currentClass.id),
    getClassAnnouncementsAction(currentClass.id),
  ])

  const parents = parentDataResult.success && parentDataResult.list ? parentDataResult.list : []
  const announcements = announcementsResult.success && announcementsResult.announcements ? announcementsResult.announcements : []

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <ParentsClientContainer
        classrooms={classrooms}
        initialClassroomId={currentClass.id}
        initialParents={parents}
        initialAnnouncements={announcements}
      />
    </div>
  )
}
