// src/app/admin/classes/[classId]/reports/[studentId]/page.tsx

import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudentDetailedReportAction } from '@/app/actions/reports'
import { StudentReportCard } from '@/components/admin/reports/StudentReportCard'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Phiếu Đánh Giá & Báo Cáo Tiến Độ | GameHub Admin',
}

interface PageProps {
  params: Promise<{
    classId: string
    studentId: string
  }>
}

export default async function StudentReportPage({ params }: PageProps) {
  const { classId, studentId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=/admin/classes/${classId}/reports/${studentId}`)
  }

  const res = await getStudentDetailedReportAction(classId, studentId)

  if (!res.success || !res.report) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8 px-4">
        <Link
          href={`/admin/dashboard/classes/${classId}`}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="size-3.5 mr-1" />
          Quay lại lớp học
        </Link>

        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
          <div className="size-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Không thể tải báo cáo học sinh
          </h2>
          <p className="text-sm text-slate-600">
            {res.error || 'Học sinh này chưa có dữ liệu hoặc bạn không có quyền truy cập.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <StudentReportCard
      initialReport={res.report}
      classroomId={classId}
      teacherName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'Giáo viên'}
    />
  )
}
