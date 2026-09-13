// src/components/space/SpaceHeaderBar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, RotateCcw, Rocket, Sparkles } from 'lucide-react'
import type { AstronautRank } from '@/types/phonics-space'

interface SpaceHeaderBarProps {
  astronautRank: AstronautRank
  totalCompleted: number
  totalAvailable: number
  cosmicCrystals: number
  onOpenCompendium: () => void
  onResetProgress: () => void
}

export function SpaceHeaderBar({
  astronautRank,
  totalCompleted,
  totalAvailable,
  cosmicCrystals,
  onOpenCompendium,
  onResetProgress,
}: SpaceHeaderBarProps) {
  const rankMap: Record<AstronautRank, { title: string; badgeStyle: string }> = {
    'cadet-explorer': {
      title: 'Thiếu Sinh Quân Vũ Trụ 🚀',
      badgeStyle: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    },
    'fleet-commander': {
      title: 'Chỉ Huy Phi Đội 🛸',
      badgeStyle: 'bg-amber-100 text-amber-950 border-amber-300',
    },
    'star-lord': {
      title: 'Chúa Tể Thiên Hà 🌌',
      badgeStyle: 'bg-purple-100 text-purple-950 border-purple-300',
    },
  }

  const currentRank = rankMap[astronautRank] || rankMap['cadet-explorer']

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
        {/* Astronaut Rank Badge */}
        <span
          className={`px-4 py-2 rounded-2xl border font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs ${currentRank.badgeStyle}`}
        >
          {currentRank.title}
        </span>

        {/* Missions Completed Counter */}
        <span className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-300 text-indigo-950 font-black text-base sm:text-lg inline-flex items-center gap-2 shadow-xs">
          <Rocket className="size-5 text-indigo-600" />
          <span>
            Nhiệm Vụ: {totalCompleted}/{totalAvailable}
          </span>
        </span>

        {/* Cosmic Crystals Counter */}
        <span className="px-4 py-2 rounded-2xl bg-cyan-50 border border-cyan-300 text-cyan-950 font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs">
          <Sparkles className="size-5 text-cyan-600" />
          <span>{cosmicCrystals} Tinh Thể 💎</span>
        </span>

        {/* Space Compendium Modal Trigger */}
        <button
          type="button"
          onClick={onOpenCompendium}
          aria-label="Mở bách khoa thiên văn vũ trụ"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
        >
          <BookOpen className="size-5" />
          <span>Bách Khoa Thiên Văn</span>
        </button>

        {/* Reset Progress Button */}
        <button
          type="button"
          onClick={onResetProgress}
          aria-label="Đặt lại hành trình vũ trụ"
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          title="Bắt đầu lại chuyến bay vũ trụ mới"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>
    </div>
  )
}
