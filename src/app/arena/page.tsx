// src/app/arena/page.tsx

import React from 'react'
import { ArenaJoinForm } from '@/components/arena/ArenaJoinForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Vào Đấu Trường Trực Tiếp | GameHub Arena',
  description: 'Tham gia thi đấu trắc nghiệm thời gian thực cùng bạn bè trong lớp',
}

interface ArenaJoinPageProps {
  searchParams: Promise<{ pin?: string }>
}

export default async function ArenaJoinPage({ searchParams }: ArenaJoinPageProps) {
  const resolvedParams = await searchParams
  const initialPin = resolvedParams?.pin || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 flex flex-col items-center justify-center p-4">
      <ArenaJoinForm initialPin={initialPin} />
    </div>
  )
}
