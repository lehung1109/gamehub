// src/app/arena/[pin]/page.tsx

import React from 'react'
import Link from 'next/link'
import { getLiveArenaByPinAction } from '@/app/actions/arena'
import { StudentArenaPlay } from '@/components/arena/StudentArenaPlay'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ArenaPlayPageProps {
  params: Promise<{ pin: string }>
  searchParams: Promise<{ studentName?: string; avatar?: string }>
}

export default async function ArenaPlayPage({ params, searchParams }: ArenaPlayPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const pinCode = resolvedParams?.pin || ''
  const studentName = resolvedSearchParams?.studentName || 'Học sinh'
  const avatar = resolvedSearchParams?.avatar || '🦊'

  const res = await getLiveArenaByPinAction(pinCode)

  if (!res.success || !res.arena) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="size-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Không tìm thấy phòng đấu</h2>
          <p className="text-xs text-slate-500">
            Mã PIN <span className="font-mono font-bold text-slate-800">{pinCode}</span> không tồn tại hoặc phòng đấu đã kết thúc.
          </p>
          <Link
            href="/arena"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Quay lại nhập mã khác</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <StudentArenaPlay
        initialArena={res.arena}
        studentName={studentName}
        avatar={avatar}
      />
    </div>
  )
}
