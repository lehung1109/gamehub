// src/app/parent/[token]/page.tsx

import React from 'react'
import Link from 'next/link'
import { getParentStudentDashboardAction } from '@/app/actions/parent'
import { ParentDashboardView } from '@/components/parent/ParentDashboardView'
import { ArrowLeft, AlertTriangle, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ParentTokenPageProps {
  params: Promise<{ token: string }>
}

export function generateMetadata() {
  return {
    title: 'Báo Cáo Học Tập Của Bé | Cổng Phụ Huynh GameHub',
    description: `Xem báo cáo học tập tuần, thông báo lớp học và chứng chỉ của học sinh.`,
  }
}

export default async function ParentDashboardPage({ params }: ParentTokenPageProps) {
  const resolvedParams = await params
  const rawToken = resolvedParams?.token || ''
  const cleanToken = decodeURIComponent(rawToken).trim()

  const res = await getParentStudentDashboardAction(cleanToken)

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-background to-indigo-50/30 dark:from-slate-950 dark:via-background dark:to-slate-900 flex items-center justify-center p-4">
        <div className="bg-card border-2 border-border rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-xl">
          <div className="size-20 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-3xl">
            <AlertTriangle className="size-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Không tìm thấy báo cáo học tập
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {res.error || 'Đường liên kết phụ huynh không hợp lệ hoặc đã hết hạn truy cập.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/parent"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-colors shadow-sm"
            >
              <ArrowLeft className="size-5" />
              <span>Nhập mã PIN hoặc liên kết khác</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 via-background to-indigo-50/20 dark:from-slate-950 dark:via-background dark:to-slate-900 pb-16">
      {/* Top Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link
            href="/parent"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold text-base transition-colors"
          >
            <ArrowLeft className="size-5" />
            <span>Đổi bé khác / Thoát</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-base text-muted-foreground font-medium">
              <ShieldCheck className="size-5 text-emerald-600" />
              <span>Đã xác thực phụ huynh</span>
            </div>
            <div className="size-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-2">
        <ParentDashboardView initialData={res.data} />
      </main>
    </div>
  )
}
