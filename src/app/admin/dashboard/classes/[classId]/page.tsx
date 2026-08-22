import React from 'react'
import Link from 'next/link'
import { getClassDashboardAction } from '@/app/actions/classes'
import { ClassOverview } from '@/components/dashboard/ClassOverview'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Tổng quan Lớp học | GameHub Admin',
}

interface PageProps {
  params: Promise<{ classId: string }>
  searchParams?: Promise<{ timeframe?: string }>
}

export default async function ClassDetailPage({ params, searchParams }: PageProps) {
  const { classId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const rawTimeframe = resolvedSearchParams.timeframe
  const timeframe: 'all' | '7d' | '30d' =
    rawTimeframe === '7d' || rawTimeframe === '30d' ? rawTimeframe : 'all'

  const { data, error } = await getClassDashboardAction(classId, timeframe)

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/dashboard/classes"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="size-3.5 mr-1" />
          Quay lại danh sách lớp
        </Link>

        <Card className="border-red-100 bg-red-50/50 py-12 text-center">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="size-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Không thể tải thông tin lớp</h2>
              <p className="text-sm text-slate-600">{error || 'Không tìm thấy thông tin lớp học này'}</p>
            </div>
            <Link
              href="/admin/dashboard/classes"
              className={buttonVariants({
                variant: 'outline',
                size: 'sm',
                className: 'mt-2 text-xs',
              })}
            >
              Quay lại danh sách lớp
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <ClassOverview data={data} />
}
