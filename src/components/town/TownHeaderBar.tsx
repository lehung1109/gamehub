// src/components/town/TownHeaderBar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, RotateCcw } from 'lucide-react'
import type { MayorRank } from '@/types/phonics-town'

interface TownHeaderBarProps {
  bricks: number
  prosperityStars: number
  mayorRank: MayorRank
  onResetTown: () => void
}

export function TownHeaderBar({
  bricks,
  prosperityStars,
  mayorRank,
  onResetTown,
}: TownHeaderBarProps) {
  const mayorRankMap: Record<MayorRank, { title: string; badgeStyle: string }> = {
    novice: {
      title: 'Thị Trưởng Tập Sự 🏅',
      badgeStyle: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    },
    expert: {
      title: 'Thị Trưởng Tài Ba 🎖️',
      badgeStyle: 'bg-amber-100 text-amber-950 border-amber-300',
    },
    legendary: {
      title: 'Thị Trưởng Huyền Thoại 👑',
      badgeStyle: 'bg-purple-100 text-purple-950 border-purple-300',
    },
  }

  const rankInfo = mayorRankMap[mayorRank] || mayorRankMap.novice

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-lg">
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
      >
        <ArrowLeft className="size-5" />
        <span>Về Trang Chủ</span>
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        {/* Mayor Rank Badge */}
        <span
          className={`px-4 py-2 rounded-2xl border font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs ${rankInfo.badgeStyle}`}
        >
          {rankInfo.title}
        </span>

        {/* Building Bricks Inventory */}
        <span className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-black text-base sm:text-lg inline-flex items-center gap-2 shadow-xs">
          <span className="text-xl">🧱</span>
          <span>Gạch Xây Dựng: {bricks}</span>
        </span>

        {/* Prosperity Stars */}
        <span className="px-4 py-2 rounded-2xl bg-sky-50 border border-sky-300 text-sky-950 font-black text-base sm:text-lg inline-flex items-center gap-2 shadow-xs">
          <Sparkles className="size-5 text-sky-500 fill-sky-400" />
          <span>Thịnh Vượng: {prosperityStars}</span>
        </span>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onResetTown}
          aria-label="Bắt đầu lại thành phố mới"
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 cursor-pointer transition-colors"
          title="Bắt đầu lại thị trấn"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>
    </div>
  )
}
