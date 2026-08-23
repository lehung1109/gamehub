import React from 'react'
import Link from 'next/link'
import { getStudentDashboardAction } from '@/app/actions/classes'
import { StudentDetail } from '@/components/dashboard/StudentDetail'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Chi tiết Tiến trình Học sinh | GameHub Admin',
}

interface PageProps {
  params: Promise<{ classId: string; studentId: string }>
  searchParams?: Promise<{ timeframe?: string }>
}

export default async function StudentDetailPage({ params, searchParams }: PageProps) {
  const { classId, studentId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const rawTimeframe = resolvedSearchParams.timeframe
  const timeframe: 'all' | '7d' | '30d' =
    rawTimeframe === '7d' || rawTimeframe === '30d' ? rawTimeframe : 'all'

  const { data, error } = await getStudentDashboardAction(classId, studentId, timeframe)

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link
          href={`/admin/dashboard/classes/${classId}`}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="size-3.5 mr-1" />
          Quay lại lớp học
        </Link>

        <Card className="border-red-100 bg-red-50/50 py-12 text-center">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="size-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Không thể tải thông tin học sinh</h2>
              <p className="text-sm text-slate-600">
                {error || 'Không tìm thấy thông tin học sinh này'}
              </p>
            </div>
            <Link
              href={`/admin/dashboard/classes/${classId}`}
              className={buttonVariants({
                variant: 'outline',
                size: 'sm',
                className: 'mt-2 text-xs',
              })}
            >
              Quay lại lớp học
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <StudentDetail data={data} />
}
