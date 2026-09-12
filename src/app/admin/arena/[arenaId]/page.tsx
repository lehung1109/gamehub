// src/app/admin/arena/[arenaId]/page.tsx

import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLiveArenaByIdAction } from '@/app/actions/arena'
import { TeacherArenaHost } from '@/components/admin/arena/TeacherArenaHost'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface AdminArenaPageProps {
  params: Promise<{ arenaId: string }>
}

export default async function AdminArenaPage({ params }: AdminArenaPageProps) {
  const resolvedParams = await params
  const arenaId = resolvedParams?.arenaId || ''

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const res = await getLiveArenaByIdAction(arenaId)

  if (!res.success || !res.arena) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl border border-slate-200">
          <div className="size-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Không tìm thấy phòng đấu</h2>
          <p className="text-xs text-slate-500">
            Phòng đấu không tồn tại hoặc đã bị hủy.
          </p>
          <Link
            href="/admin/arena/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Tạo phòng đấu mới</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <TeacherArenaHost
        initialArena={res.arena}
        initialParticipants={res.participants || []}
      />
    </div>
  )
}
