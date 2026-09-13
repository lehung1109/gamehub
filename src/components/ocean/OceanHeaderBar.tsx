// src/components/ocean/OceanHeaderBar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, RotateCcw, Compass, Sparkles } from 'lucide-react'
import type { DiverRank } from '@/types/phonics-ocean'

interface OceanHeaderBarProps {
  diverRank: DiverRank
  totalCompleted: number
  totalAvailable: number
  pearls: number
  onOpenCompendium: () => void
  onResetProgress: () => void
}

export function OceanHeaderBar({
  diverRank,
  totalCompleted,
  totalAvailable,
  pearls,
  onOpenCompendium,
  onResetProgress,
}: OceanHeaderBarProps) {
  const rankMap: Record<DiverRank, { title: string; badgeStyle: string }> = {
    snorkel_cadet: {
      title: 'Thợ Lặn Tập Sự 🤿',
      badgeStyle: 'bg-teal-100 text-teal-950 border-teal-300',
    },
    sub_pilot: {
      title: 'Thuyền Trưởng Tàu Ngầm 🚤',
      badgeStyle: 'bg-cyan-100 text-cyan-950 border-cyan-300',
    },
    ocean_master: {
      title: 'Hải Vương Biển Sâu 🔱',
      badgeStyle: 'bg-indigo-100 text-indigo-950 border-indigo-300',
    },
  }

  const currentRank = rankMap[diverRank] || rankMap['snorkel_cadet']

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-lg">
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
      >
        <ArrowLeft className="size-5" />
        <span>Về Trang Chủ</span>
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        {/* Diver Rank Badge */}
        <span
          className={`px-4 py-2 rounded-2xl border font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs ${currentRank.badgeStyle}`}
        >
          {currentRank.title}
        </span>

        {/* Missions Completed Counter */}
        <span className="px-4 py-2 rounded-2xl bg-cyan-50 border border-cyan-300 text-cyan-950 font-black text-base sm:text-lg inline-flex items-center gap-2 shadow-xs">
          <Compass className="size-5 text-cyan-600" />
          <span>
            Nhiệm Vụ: {totalCompleted}/{totalAvailable}
          </span>
        </span>

        {/* Ocean Pearls Counter */}
        <span className="px-4 py-2 rounded-2xl bg-teal-50 border border-teal-300 text-teal-950 font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs">
          <Sparkles className="size-5 text-teal-600" />
          <span>{pearls} Ngọc Trai 🦪</span>
        </span>

        {/* Ocean Compendium Modal Trigger */}
        <button
          type="button"
          onClick={onOpenCompendium}
          aria-label="Mở bách khoa sinh vật đại dương"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-base transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
        >
          <BookOpen className="size-5" />
          <span>Bách Khoa Đại Dương</span>
        </button>

        {/* Reset Progress Button */}
        <button
          type="button"
          onClick={onResetProgress}
          aria-label="Đặt lại hành trình thám hiểm biển"
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          title="Bắt đầu lại chuyến lặn mới"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>
    </div>
  )
}
