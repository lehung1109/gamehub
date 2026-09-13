// src/components/time/TimeHeaderBar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Landmark, RotateCcw, Hourglass, Sparkles } from 'lucide-react'
import type { TimeTravelerRank } from '@/types/phonics-time'

interface TimeHeaderBarProps {
  travelerRank: TimeTravelerRank
  totalCompleted: number
  totalAvailable: number
  chronoOrbs: number
  onOpenMuseum: () => void
  onResetProgress: () => void
}

export function TimeHeaderBar({
  travelerRank,
  totalCompleted,
  totalAvailable,
  chronoOrbs,
  onOpenMuseum,
  onResetProgress,
}: TimeHeaderBarProps) {
  const rankMap: Record<TimeTravelerRank, { title: string; badgeStyle: string }> = {
    novice_nomad: {
      title: 'Nhà Du Hành Tập Sự 🧭',
      badgeStyle: 'bg-amber-100 text-amber-950 border-amber-300',
    },
    chrono_voyager: {
      title: 'Chuyên Viên Dòng Thời Gian ⏳',
      badgeStyle: 'bg-sky-100 text-sky-950 border-sky-300',
    },
    time_space_master: {
      title: 'Bậc Thầy Không Thời Gian 🌌',
      badgeStyle: 'bg-purple-100 text-purple-950 border-purple-300',
    },
  }

  const currentRank = rankMap[travelerRank] || rankMap['novice_nomad']

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border-2 border-stone-200 shadow-lg">
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-base font-bold transition-all"
      >
        <ArrowLeft className="size-5" />
        <span>Về Trang Chủ</span>
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        {/* Time Traveler Rank Badge */}
        <span
          className={`px-4 py-2 rounded-2xl border font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs ${currentRank.badgeStyle}`}
        >
          {currentRank.title}
        </span>

        {/* Relics Completed Counter */}
        <span className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-black text-base sm:text-lg inline-flex items-center gap-2 shadow-xs">
          <Hourglass className="size-5 text-amber-600" />
          <span>
            Cổ Vật: {totalCompleted}/{totalAvailable}
          </span>
        </span>

        {/* Chrono-Orbs Counter */}
        <span className="px-4 py-2 rounded-2xl bg-purple-50 border border-purple-300 text-purple-950 font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs">
          <Sparkles className="size-5 text-purple-600" />
          <span>{chronoOrbs} Bảo Ngọc ⏳</span>
        </span>

        {/* Time Museum Modal Trigger */}
        <button
          type="button"
          onClick={onOpenMuseum}
          aria-label="Mở viện bảo tàng không thời gian time museum"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
        >
          <Landmark className="size-5" />
          <span>Viện Bảo Tàng Thời Gian</span>
        </button>

        {/* Reset Progress Button */}
        <button
          type="button"
          onClick={onResetProgress}
          aria-label="Đặt lại hành trình cỗ máy thời gian"
          className="p-2.5 rounded-2xl bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
          title="Bắt đầu lại hành trình cỗ máy thời gian mới"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>
    </div>
  )
}
